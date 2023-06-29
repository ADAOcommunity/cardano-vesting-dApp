import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { DatePicker } from "@/components/ui/date-picker"
import {Icons} from "@/components/icons"

export default function Page() {
  return (
    <div className="container mt-5 px-4">
    <Tabs defaultValue="account" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Schedule</TabsTrigger>
        <TabsTrigger value="password">Artifacts</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              Settings for the vesting schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>Full Unlock Date</div>
            <div className="space-y-1">
              <DatePicker />
            </div>
            <div>Next Unlock Date</div>
            <div className="space-y-1">
              <DatePicker />
            </div>
            <div className="font-bold">Beneficiaries</div>
            <div className="flex flex-row">
              <div className="p-2">
                <Icons.user/>
              </div>
              <div className="w-3/4">
                <Input id="username" defaultValue="$project-developer" />
              </div>
            </div>
            <div className="flex flex-row">
              <div className="p-2">
                <Icons.user/>
              </div>
              <div className="w-3/4">
                <Input id="username" defaultValue="$project-marketing" />
              </div>
            </div>
            <div className="flex flex-row">
              <div className="p-2">
                <Icons.user/>
              </div>
              <div className="w-3/4">
                <Input id="username" defaultValue="$project-designer" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Next</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Artifacts</CardTitle>
            <CardDescription>
              Deposit tokens into the contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
    </div>
  )
}
