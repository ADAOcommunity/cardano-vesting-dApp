use aiken/dict
use aiken/list
use aiken/transaction.{ScriptContext, Transaction} as tx
use aiken/transaction/value
use types.{Datum}
use utils.{
  calculate_withdrawable_amount, can_claim, convert_datum, get_contract_address,
  get_org_tokens_present_amount, get_requested_amount,
}

type Action {
  Claim
  Cancel
}

validator {
  fn vesting(datum: Datum, rdmr: Action, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = ctx

    let Transaction { outputs, inputs, .. } = transaction
    when rdmr is {
      Claim -> can_claim(ctx, datum, outputs, purpose)
      Cancel ->
        get_org_tokens_present_amount(inputs, datum.org_token) >= datum.tokens_required
    }
  }
}
