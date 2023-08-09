use aiken/dict
use aiken/list
use aiken/transaction.{
  DatumHash, InlineDatum, NoDatum, Output, OutputReference, ScriptContext,
  Transaction,
} as tx
use aiken/transaction/credential.{
  Address, Credential, Inline, PaymentCredential, ScriptCredential,
  VerificationKey, VerificationKeyCredential, from_verification_key,
}
use aiken/transaction/value.{
  AssetName, PolicyId, Value, add, from_asset, merge, quantity_of, zero,
}
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

pub fn value_sent_to_address(tx: Transaction, address: Address) -> Value {
  when list.filter(tx.outputs, fn(output) { output.address == address }) is {
    [output] ->
      output.value
    _ ->
      error
  }
}

pub fn value_sent_to_pubkeyhash(
  tx: Transaction,
  pubkeyhash: VerificationKeyHash,
) -> Value {
  when
    list.filter(
      tx.outputs,
      fn(output) {
        expect cred: PaymentCredential =
          output.address.payment_credential
        expect pay_addr: Address =
          Address { payment_credential: cred, stake_credential: None }
        pay_addr == from_verification_key(pubkeyhash)
      },
    )
  is {
    [output] ->
      output.value
    _ ->
      error
  }
}

pub fn token_amount_from_value(
  val: Value,
  asset_policy: ByteArray,
  asset_name: ByteArray,
) {
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
      error
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

pub fn calculate_withdrawable_amount(
  transaction_date: POSIXTime,
  datum: Datum,
) -> Int {
  let time_passed =
    transaction_date - datum.date
  let periods_passed =
    time_passed / datum.period_length
  let total_withdrawable =
    periods_passed * datum.amount_per_period
  total_withdrawable - datum.withdrawn_amount
}

pub fn update_datum(datum: Datum, sent_to_beneficiary: Int) -> Datum {
  // get beneficiary address from datum. Needed function to get value sent to payment key hash instead of addresss??
  // get value sent to beneficiary address
  // calculate difference between value sent to beneficiary address and value sent to contract
  // add difference to datum field named "withdrawn_amount", keep the other fields the same
  // return updated datum
  let withdrawn_to_date: Int =
    datum.withdrawn_amount
  let new_withdrawn: Int =
    withdrawn_to_date + sent_to_beneficiary
  let new_datum =
    Datum { ..datum, withdrawn_amount: new_withdrawn }
  new_datum
}
