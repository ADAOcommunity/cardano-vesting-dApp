use aiken/dict
use aiken/interval.{Finite, NegativeInfinity, PositiveInfinity}
use aiken/list
use aiken/transaction.{
  DatumHash, InlineDatum, NoDatum, Output, OutputReference, ScriptContext,
  Transaction,
} as tx
use aiken/transaction/credential.{
  Address, Inline, PaymentCredential, ScriptCredential,
  VerificationKeyCredential, from_verification_key,
}
use aiken/transaction/value.{Value, merge, zero}
use types.{Datum, POSIXTime, ScriptHash, VerificationKeyHash}

/// function to convert validator script hash into validator address
pub fn address_from_scripthash(script_hash: ByteArray, stake_hash: ByteArray) {
  Address {
    payment_credential: ScriptCredential(script_hash),
    stake_credential: Some(Inline(VerificationKeyCredential(stake_hash))),
  }
}

pub fn convert_datum(datum: tx.Datum) -> Datum {
  when datum is {
    NoDatum ->
      error
    DatumHash(_) ->
      error
    InlineDatum(d) -> {
      expect return_datum: Datum =
        d
      return_datum
    }
  }
}

pub fn value_sent_to_scripthash(
  tx: Transaction,
  scripthash: ScriptHash,
) -> Value {
  let outputs =
    list.filter(
      tx.outputs,
      fn(output) {
        output.address.payment_credential == ScriptCredential(scripthash)
      },
    )
  list.foldl(
    outputs,
    zero(),
    fn(output: Output, final_val: Value) -> Value {
      merge(final_val, output.value)
    },
  )
}

/// gets the value sent to a scripthash with a datum
pub fn value_sent_to_scripthash_with_datum(
  tx: Transaction,
  scripthash: ScriptHash,
  payment_datum: tx.Datum,
) -> Value {
  let outputs =
    list.filter(
      tx.outputs,
      fn(output) {
        output.address.payment_credential == ScriptCredential(scripthash) && output.datum == InlineDatum(
          payment_datum,
        )
      },
    )
  list.foldl(
    outputs,
    zero(),
    fn(output: Output, final_val: Value) -> Value {
      merge(final_val, output.value)
    },
  )
}

// gets the value sent to an address or returns zero if nothing was sent to it
pub fn value_sent_to_address(tx: Transaction, address: Address) -> Value {
  when list.filter(tx.outputs, fn(output) { output.address == address }) is {
    [output] ->
      output.value
    _ ->
      zero()
  }
}

// gets the value sent to a pubkeyhash or returns zero if nothing was sent to it
pub fn value_sent_to_pubkeyhash(
  tx: Transaction,
  pubkeyhash: VerificationKeyHash,
) -> Value {
  when
    list.filter(
      tx.outputs,
      fn(output) {
        let cred: PaymentCredential =
          output.address.payment_credential
        let pay_addr: Address =
          Address { payment_credential: cred, stake_credential: None }
        pay_addr == from_verification_key(pubkeyhash)
      },
    )
  is {
    [output] ->
      output.value
    _ ->
      zero()
  }
}

/// gets the amount of a specific token from a value
pub fn token_amount_from_value(
  val: Value,
  asset_policy: ByteArray,
  asset_name: ByteArray,
) -> Int {
  expect [(name, amount)] =
    val
      |> value.tokens(asset_policy)
      |> dict.to_list()
  when name == asset_name is {
    True ->
      amount
    False ->
      0
  }
}

/// We expect outputs to be unique. Each output is tagged with a datum.
/// We also expect the datum to be inline
pub fn value_sent_to_with_datum(
  tx: Transaction,
  address: Address,
  payment_datum: tx.Datum,
) -> Value {
  when
    list.filter(
      tx.outputs,
      fn(output) {
        output.address == address && output.datum == InlineDatum(payment_datum)
      },
    )
  is {
    [output] ->
      output.value
    _ ->
      zero()
  }
}

/// This is a special signing function. 
/// Signer can not only be a pub key address, but also a script address.
/// Unfortunately extra signatories can only be pub key hashes, that means we need a special mechanism 
/// to check whether a native or plutus script signed the transaction.
/// At first it sounds like a good idea to mint an ownership token, but when the other party accepts the bid or listing it will also receive the extra token.
/// This could lead to some unnecessary bloat after some time. So the better solution is to check for inputs.
/// If the transaction contains an input with the same script hash as the address in the datum we can assume the transaction was correctly signed.
/// Of course for plutus script addresses some constraints need to be added. 
pub fn tx_signed_by_address(tx: Transaction, owner: Address) -> Bool {
  when owner.payment_credential is {
    VerificationKeyCredential(keyhash) ->
      list.has(tx.extra_signatories, keyhash)
    ScriptCredential(scripthash) ->
      signed_with_input(tx, scripthash)
  }
}

fn signed_with_input(tx: Transaction, scripthash: ScriptHash) -> Bool {
  when
    list.find(
      tx.inputs,
      fn(input) {
        when input.output.address.payment_credential is {
          VerificationKeyCredential(_) ->
            False
          ScriptCredential(scripthash1) ->
            scripthash == scripthash1
        }
      },
    )
  is {
    Some(_) ->
      True
    None ->
      False
  }
}

/// calculates how much of the tokens are still locked in the schedule and available to withdraw to this date
pub fn calculate_withdrawable_amount(
  ctx: ScriptContext,
  datum: Datum,
  out_ref: OutputReference,
) -> Int {
  let transaction_start: POSIXTime =
    when ctx.transaction.validity_range.lower_bound.bound_type is {
      Finite(time) ->
        time
      PositiveInfinity ->
        error
      NegativeInfinity ->
        error
    }
  let time_passed =
    transaction_start - datum.date
  let periods_passed =
    time_passed / datum.period_length
  let withdrawn_amount =
    get_withdrawn_amount(datum, ctx)
  let total_withdrawable =
    periods_passed * datum.amount_per_period
  total_withdrawable - withdrawn_amount
}

/// gets the total amount of a token vested on that UTxO based on the period length, amount per period and number of periods
pub fn get_total_vested(datum: Datum) -> Int {
  datum.period_length * datum.amount_per_period * datum.num_periods
}

/// gets the amount of tokens that have already been withdrawn from the schedule
pub fn get_withdrawn_amount(datum: Datum, ctx: ScriptContext) -> Int {
  let total =
    get_total_vested(datum)
  let remaining =
    get_locked_amount(ctx, datum.token_policy_id, datum.token_name)
  total - remaining
}

/// gets the amount of tokens currently locked in the input that is being unlocked
pub fn get_locked_amount(
  ctx: ScriptContext,
  policy_id: ByteArray,
  asset_name: ByteArray,
) -> Int {
  expect tx.Spend(out_ref) =
    ctx.purpose
  expect Some(input) =
    list.find(
      ctx.transaction.inputs,
      fn(input) { input.output_reference == out_ref },
    )
  token_amount_from_value(input.output.value, policy_id, asset_name)
}

/// gets the amount of tokens being unlocked based on how much is being sent to the beneficiary address and amount locked backed to the contract with the same dautm
pub fn get_requested_amount(ctx: ScriptContext, datum: tx.Datum) -> Int {
  let Datum { beneficiary, token_policy_id, token_name, .. } =
    convert_datum(datum)
  let transaction =
    ctx.transaction
  let value_to_beneficiary =
    value_sent_to_pubkeyhash(transaction, beneficiary)
  let amount_to_beneficiary =
    token_amount_from_value(value_to_beneficiary, token_policy_id, token_name)
  let contract_address =
    get_contract_address(ctx)

  let value_to_contract =
    value_sent_to_with_datum(transaction, contract_address, datum)
  let amount_to_contract =
    token_amount_from_value(value_to_contract, token_policy_id, token_name)
  amount_to_beneficiary - amount_to_contract
}

/// gets the contract address from the input being unlocked
pub fn get_contract_address(ctx: ScriptContext) -> Address {
  expect tx.Spend(output_reference) =
    ctx.purpose
  expect Some(input) =
    list.find(
      ctx.transaction.inputs,
      fn(input) { input.output_reference == output_reference },
    )
  input.output.address
}
