use aiken/transaction.{
  DatumHash, InlineDatum, NoDatum, OutputReference, ScriptContext, Transaction,
} as tx
use aiken/transaction/credential.{
  Address, Credential, Inline, ScriptCredential, VerificationKey,
  VerificationKeyCredential,
}
use aiken/transaction/value
use types.{Datum, POSIXTime, VerificationKeyHash}

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
