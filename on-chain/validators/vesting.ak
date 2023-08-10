use aiken/dict
use aiken/interval.{
  Finite, Interval, IntervalBound, IntervalBoundType, NegativeInfinity,
  PositiveInfinity,
}
use aiken/list
use aiken/transaction.{
  DatumHash, InlineDatum, NoDatum, OutputReference, ScriptContext, Transaction,
  ValidityRange,
} as tx
use aiken/transaction/value
use types.{Datum, POSIXTime, VerificationKeyHash}
use utils.{
  address_from_scripthash, calculate_withdrawable_amount, convert_datum,
  token_amount_from_value, value_sent_to_pubkeyhash,
}

type Action {
  Claim
  Cancel
}

// requires token_name equvialent to org token policy_id, AND the script hash of the spending validator as parameter
// in order to be minted it must be minted 1 token max per output within the the validator script, the datum must include both the beacon policy, as well as the org policy, the org policy must be used as the token name of the org policy.
validator(beacon_policy: ByteArray) {
  fn vesting(datum: tx.Datum, rdmr: Action, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } =
      ctx
    expect tx.Spend(output_reference) =
      purpose

    let Transaction { inputs, outputs, mint, validity_range, .. } =
      transaction

    let converted_datum =
      convert_datum(datum)
    expect Datum { token_policy_id, token_name, beneficiary, .. } =
      converted_datum
    let value_to_beneficiary =
      value_sent_to_pubkeyhash(transaction, beneficiary)
    let amount_to_beneficiary =
      token_amount_from_value(value_to_beneficiary, token_policy_id, token_name)

    let transaction_start: POSIXTime =
      when validity_range.lower_bound.bound_type is {
        Finite(time) ->
          time
        PositiveInfinity ->
          error
        NegativeInfinity ->
          error
      }

    let withdrawable_amount =
      calculate_withdrawable_amount(transaction_start, converted_datum)

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
        if amount_to_beneficiary == withdrawable_amount {
          True
        } else {
          let new_datum =
            update_datum(converted_datum, amount_to_beneficiary)
          if amount_to_beneficiary > withdrawable_amount {
            todo
          } else {
            todo
          }
        }
      Cancel ->
        todo
    }
  }
}
