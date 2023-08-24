import { OrgForm } from "@/components/org/org-form";
import Layout from "@/components/ui/layout";


export default function CreateOrg() {
    return (
        <Layout title={"Create Organization"} description={"Add member addresses or ada handles to create an organization that will manage a vesting schedule."} >
            <div>
                <OrgForm />
            </div>
        </Layout>

    )
}