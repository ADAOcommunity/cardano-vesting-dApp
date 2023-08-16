use aiken/dict
use aiken/list
use aiken/transaction.{ScriptContext, Transaction} as tx
use aiken/transaction/value
use types.{Datum}
use utils.{calculate_withdrawable_amount, convert_datum, get_requested_amount}

type Action {
  Claim
  Cancel
}

validator {
  fn vesting(datum: Datum, rdmr: Action, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = ctx
    expect tx.Spend(output_reference) = purpose

    let Transaction { outputs, .. } = transaction

    let amount_to_beneficiary = get_requested_amount(ctx, datum)

    let withdrawable_amount =
      calculate_withdrawable_amount(ctx, datum, output_reference)

    let no_tokens_leave_tx: Bool =
      list.all(
        outputs,
        fn(output) {
          let assets =
            output.value
              |> value.tokens(converted_datum.beacon_token)
              |> dict.to_list()
          assets == [] || output.address == get_contract_address(ctx)
        },
      )
    let org_tokens_present: Bool =
      list.all(
        outputs,
        fn(output) {
          let assets =
            output.value
              |> value.tokens(datum.org_token)
              |> dict.to_list()
          list.length(assets) >= datum.tokens_required
        },
      )
    when rdmr is {
      Claim ->
        amount_to_beneficiary <= withdrawable_amount && no_tokens_leave_tx
      Cancel ->
        list.all(
          outputs,
          fn(output) {
            let assets =
              output.value
                |> value.tokens(datum.org_token)
                |> dict.to_list()
            list.length(assets) >= datum.tokens_required
          },
        )
    }
  }
}
