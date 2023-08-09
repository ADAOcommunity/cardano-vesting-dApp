use aiken/dict
use aiken/list
use aiken/transaction.{
  DatumHash, InlineDatum, NoDatum, OutputReference, ScriptContext, Transaction,
} as tx
use aiken/transaction/value
use types.{Datum, VerificationKeyHash}
use utils.{address_from_scripthash, convert_datum}

type Action {
  Claim
  Cancel
}

// requires token_name equvialent to org token policy_id, AND the script hash of the spending validator as parameter
// in order to be minted it must be minted 1 token max per output within the the validator script, the datum must include both the beacon policy, as well as the org policy, the org policy must be used as the token name of the org policy.
validator(beacon_policy: ByteArray) {
  fn vesting(datum: Datum, rdmr: Action, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } =
      ctx
    expect tx.Spend(output_reference) =
      purpose

    let Transaction { inputs, outputs, mint, .. } =
      transaction

    let no_tokens_leave_tx =
      list.all(
        outputs,
        fn(output) {
          let assets =
            output.value
              |> value.tokens(beacon_policy)
              |> dict.to_list()
          assets == []
        },
      )

    when rdmr is {
      Claim ->
        todo
      Cancel ->
        todo
    }
  }
}
