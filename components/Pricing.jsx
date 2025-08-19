import PricingBasic from "./PricingBasic"
import PricingEnterprise from "./PricingEnterprise"
import PricingPremium from "./PricingPremium"

const  Pricing = () =>{

return (
    <div className="flex gap-[1rem] justify-center max-lg:flex-wrap px-2 pb-12"> 
    <PricingBasic/>
    <PricingPremium/>
    <PricingEnterprise/>
    </div>
)
}

export default Pricing