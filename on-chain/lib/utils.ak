use aiken/dict
use aiken/list
use aiken/transaction.{
  DatumHash, InlineDatum, NoDatum, Output, OutputReference, ScriptContext,
  Transaction,
} as tx
use aiken/transaction/credential.{
  Address, Credential, Inline, ScriptCredential, VerificationKey,
  VerificationKeyCredential,
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

pub fn value_paid_to_address(tx: Transaction, address: Address) -> Value {
  when list.filter(tx.outputs, fn(output) { output.address == address }) is {
    [output] ->
      output.value
    _ ->
      error
  }
}

/// We expect outputs to be unique. Each output is tagged with a datum.
/// We also expect the datum to be inline
pub fn value_paid_to_with_datum(
  tx: Transaction,
  address: Address,
  payment_datum: Datum,
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
