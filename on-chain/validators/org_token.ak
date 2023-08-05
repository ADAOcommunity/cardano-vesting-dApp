use aiken/dict
use aiken/list
use aiken/transaction.{OutputReference, ScriptContext, Transaction} as tx
use aiken/transaction/credential.{
  Address, Credential, Inline, ScriptCredential, VerificationKeyCredential,
}
use aiken/transaction/value

type Action {
  Mint
  Burn
}

validator(token_name: ByteArray, utxo_ref: OutputReference) {
  fn org_token(rdmr: Action, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } =
      ctx
    expect tx.Mint(policy_id) =
      purpose
    let Transaction { inputs, mint, .. } =
      transaction
    expect [(asset_name, amount)] =
      mint
        |> value.from_minted_value
        |> value.tokens(policy_id)
        |> dict.to_list()
    when rdmr is {
      Mint -> {
        expect Some(_input) =
          list.find(inputs, fn(input) { input.output_reference == utxo_ref })
        amount > 0 && asset_name == token_name
      }
      Burn ->
        amount == -1 && asset_name == token_name
    }
  }
}

/// function to convert validator script hash into validator address
pub fn address_from_scripthash(script_hash: ByteArray, stake_hash: ByteArray) {
  Address {
    payment_credential: ScriptCredential(script_hash),
    stake_credential: Some(Inline(VerificationKeyCredential(stake_hash))),
  }
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

    expect script_outputs =
      list.filter(outputs, fn(output) { output.address == script_address })

    let is_correct_script_outputs =
      list.all(
        script_outputs,
        fn(output) {
          expect [(asset_name, amount)] =
            output.value
              |> value.tokens(policy_id)
              |> dict.to_list()
          amount == 1
        },
      )
    expect non_script_outputs =
      list.filter(outputs, fn(output) { output.address != script_address })

    let is_correct_non_script_outputs =
      list.all(
        script_outputs,
        fn(output) {
          expect asset_list =
            output.value
              |> value.tokens(policy_id)
              |> dict.to_list()
          list.length(asset_list) == 0
        },
      )

    when rdmr is {
      Mint ->
        is_correct_script_outputs && is_correct_non_script_outputs
      Burn ->
        True
    }
  }
}
