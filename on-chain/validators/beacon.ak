use aiken/dict
use aiken/list
use aiken/transaction.{
  DatumHash, InlineDatum, NoDatum, OutputReference, ScriptContext, Transaction,
} as tx
use aiken/transaction/value
use types.{Datum, VerificationKeyHash}
use utils.{address_from_scripthash, convert_datum}

type Action {
  Mint
  Burn
}

// requires token_name equvialent to org token policy_id, AND the script hash of the spending validator as parameter
// in order to be minted it must be minted 1 token max per output within the the validator script, the datum must include both the beacon policy, as well as the org policy, the org policy must be used as the token name of the org policy.
validator(script_hash: ByteArray, stake_hash: ByteArray) {
  fn beacon_token(rdmr: Action, ctx: ScriptContext) -> Bool {
    let script_address =
      address_from_scripthash(script_hash, stake_hash)

    let ScriptContext { transaction, purpose } =
      ctx

    expect tx.Mint(policy_id) =
      purpose

    let Transaction { inputs, outputs, mint, .. } =
      transaction

    let script_outputs =
      list.filter(outputs, fn(output) { output.address == script_address })
    let outputs_with_beacon =
      list.filter(
        outputs,
        fn(output) {
          list.has(dict.keys(value.to_dict(output.value)), policy_id)
        },
      )

    let is_correct_outputs =
      list.all(
        outputs_with_beacon,
        fn(output) {
          expect [(asset_name, amount)] =
            output.value
              |> value.tokens(policy_id)
              |> dict.to_list()
          expect Datum { org_token, beacon_token, .. } =
            convert_datum(output.datum)
          output.address == script_address && amount == 1 && org_token == asset_name && beacon_token == policy_id
        },
      )

    let no_tokens_leave_tx =
      list.all(
        outputs,
        fn(output) {
          let assets =
            output.value
              |> value.tokens(policy_id)
              |> dict.to_list()
          assets == []
        },
      )

    when rdmr is {
      Mint ->
        is_correct_outputs
      Burn ->
        no_tokens_leave_tx
    }
  }
}
