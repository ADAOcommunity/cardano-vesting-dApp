# ADAO Vesting Application

ADAO's Vesting Application is a specialized platform designed for the Cardano community, enabling organizations and individuals to create and manage token vesting schedules.

## Workflow

1. **Create an Organization**: Define members by their addresses. A unique token with a specific policy ID is sent to each member to allow managing vesting schedules.

2. **Mint Organization Tokens**: Tokens are minted and distributed among members post organization creation.

3. **Create Vesting Schedules**: Set up vesting schedules by specifying beneficiaries, token distribution per period, and the total number of periods.

4. **Claim Benefits**: Beneficiaries can view and claim their amounts through the dashboard.

## Features

- Intuitive User Interface
- Secure and Compliant Token Vesting Schedules
- Real-time Dashboard for Beneficiaries
- Support for Various Token Types

## Installation

Follow the instructions below to set up the project locally:

```bash
git clone <repository-url>
cd <project-name>
npm install
npm run start
```
Create an .env file by modifying the .env.example and adding your blockfrost api key.

## Usage

The application provides an efficient way to manage vesting schedules within the Cardano community. Follow the steps below to utilize its features:

### Creating an Organization
- Navigate to the "Create Organization" page.
- Enter the addresses of organization members.
- Each member will receive a unique token used to manage vesting schedules.

### Minting Organization Tokens
- After creating the organization, the application will mint and distribute tokens among the members.

### Creating Vesting Schedules
- Go to the organization dashboard.
- Specify the beneficiaries, distribution amounts, and total periods to create a vesting schedule.

### Claiming Benefits
- Beneficiaries can access the dashboard to view claimable amounts and proceed to claim them.

## Technologies

- React
- TypeScript
- Tailwind CSS
- Next.js
- Three.js (for animations)

## Contributing

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on contributing to the project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For any questions, issues, or feature requests, please contact the team at support@example.com or open an issue on GitHub.
