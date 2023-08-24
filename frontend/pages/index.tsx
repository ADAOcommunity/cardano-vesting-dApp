import Image from 'next/image'
import { Inter } from 'next/font/google'
import Layout from '@/components/ui/layout'
import { MainNav } from '@/components/main-nav'
import WalletConnect from '@/components/wallet-connect'
import { Button } from '@/components/ui/button'
import HeroBackground from '@/components/hero-background'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <div className="border-b border-muted-foreground relative z-[100]">
        <div className="flex h-16 items-center px-4 z-10">
          {/* <TeamSwitcher /> */}
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            {/* <Search /> */}
            <WalletConnect />
            {/* <UserNav /> */}
          </div>
        </div>
      </div>
      <HeroBackground />

      <div className='h-screen flex items-center flex-row w-full justify-evenly relative  '>
        <div className='w-1/3 flex flex-col text-left space-y-8 px-4 z-10'>
          <h1 className='text-4xl text-primary font-bold tracking-tight'> Empowering the Cardano Community with ADAO Vesting Solutions</h1>
          <div className='text-secondary-foreground text-lg' >Designed for the Cardano community. Emphasizing growth, transparency, and security, our platform caters to organizations and individuals alike. Create compliant token vesting schedules or manage digital assets with functionality and ease.</div>
        </div>
        <div className='text-left w-1/3 flex flex-col space-y-8 px-4 justify-even z-10'>
          <div className='flex flex-col space-y-4 text-lg'>
            <div className='text-secondary-foreground' >
              🔒 Secure & Transparent: Built on Cardano's robust infrastructure, we provide an impenetrable and transparent environment for your token vesting needs.
            </div>
            <div className='text-secondary-foreground' >
              📈 Flexible & Customizable: From organizational structures to individual agreements, design vesting schedules that align with your unique goals and timelines.
            </div>
            <div className='text-secondary-foreground' >
              💼 Built for the Community: Crafted by Cardano enthusiasts for Cardano enthusiasts, ADAO's vesting application echoes the ethos of collaboration and innovation that drives our community forward.
            </div>
          </div>
          <div className='flex flex-row justify-evenly content-center text-center items-center align-center w-full' >
            <Link href={'/org/create'}><Button size={'lg'}>Create org</Button></Link>
            <Link href={'/#howitworks'}><Button size={'lg'} variant={'secondary'} >How it works</Button></Link>
          </div>
        </div>
      </div>

      <div id='howitworks' className='h-screen flex items-center flex-row w-full justify-evenly relative  '>
        <div className='w-2/3 flex flex-col text-left space-y-8 px-4 z-10'>
          <h1 className='text-4xl text-primary font-bold tracking-tight'>How it works</h1>
          <div className='text-secondary-foreground text-lg' >
            <ol className="list-decimal list-inside space-y-4">
              <li>
                <strong>Create an Organization:</strong> Indicate the addresses of organization members. Upon creation, one unique token with a specific policy ID is sent to each member, which can be used to cancel vesting schedules based on a specified minimum amount.
              </li>
              <li>
                <strong>Mint Organization Tokens:</strong> After creating the organization, the tokens are minted and distributed among the members.
              </li>
              <li>
                <strong>Create Vesting Schedules:</strong> Organization members can create vesting schedules by specifying the beneficiaries, the amount of tokens to be distributed per period, and the total number of periods.
              </li>
              <li>
                <strong>Claim Benefits:</strong> Beneficiaries can use the dashboard to check their claimable amounts and claim them accordingly.
              </li>
            </ol>
          </div>
          <Link href={'/org/create'}><Button size={'lg'} >Get started</Button></Link>
        </div>
      </div>
    </>
  )
}
