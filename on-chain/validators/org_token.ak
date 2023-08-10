//// contract to mint organization tokens. This is a one-shot policy based on the utxo_ref

use aiken/dict
use aiken/list
use aiken/transaction.{OutputReference, ScriptContext, Transaction} as tx
use aiken/transaction/value

type Action {
  Mint
  Burn
}

validator(token_name: ByteArray, utxo_ref: OutputReference) {
  /// mint org token
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
