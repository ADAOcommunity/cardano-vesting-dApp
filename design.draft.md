# Design (draft)

## Vesting DApp for Cardano Blockchain

### Overview

This document outlines the design for a Vesting DApp on the Cardano blockchain, allowing organizations to create their own NFT minting policy and manage the vesting process for their members. The design also includes the ability for organization representatives to overrule vesting, such as canceling someone's future tokens, if a majority decides on this action.

### Components

1. **NFT Minting Policy**: Organizations can create their own NFT minting policy by parameterizing existing on-chain scripts. This contract allows minting only for people specified by the organization in the parameters and only one token per utxo being deposited into the vesting contract. This ensures easy tracking of vested tokens.

2. **Vesting Contract**: The vesting contract will need one utxo per user/address with their vested tokens for each organization. The person depositing tokens into the contract, representing the organization, will specify the time of the full unlock and the slot when unlocking starts. The contract will then calculate the number of slots relative to the current slot to determine how many tokens are allowed to be withdrawn at the moment. This design supports linear vesting, but more complex vesting curves can be achieved by creating multiple utxos for each user.

### Workflow

1. The organization creates a new NFT minting policy by parameterizing an existing on-chain script, specifying representatives and other constraints.
2. The organization representatives deposit tokens into the vesting contract, creating at least one utxo per beneficiary.
3. The organization representatives specify time of the full unlock and slot of next unlock, and as an optional, vesting span. If vesting span is defined, with any unlock, next unlock slot will have to be always set as: ```current unlock slot + span```.
4. The contract can validate the number of allowed tokens to be withdrawn based on the current slot and the specified vesting schedule.
5. Beneficiaries can withdraw their vested tokens according to the vesting schedule.
6. Organization representatives can overrule the vesting process, such as canceling beneficiary's future tokens, if a majority decides on this action.

### Considerations

- This design allows for an easily trackable vesting process on the Cardano blockchain.
- The linear vesting schedule can be extended to more complex vesting curves by creating multiple utxos for each user.
- Allows both dynamic and pre-defined unlock schedules.
- The vesting contract ensures that only allowed members can mint tokens according to the organization's NFT minting policy.
- Organization representatives have the ability to overrule vesting decisions if a majority agrees.

### Future Enhancements

1. Implementing support for non-linear vesting schedules natively within the vesting contract.
2. Allowing organizations to update their NFT minting policy and vesting schedules after creation.
3. Enhancing the decision-making process for organization representatives to overrule vesting decisions.
