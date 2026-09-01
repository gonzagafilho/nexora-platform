function createAgentOrchestratorBridge(adapter={}) { return { createPlan(input,context){return adapter.createPlan?.(input,context) ?? {steps:[],input};}, executePlan(plan,context){return adapter.executePlan?.(plan,context) ?? {ok:true,plan,data:null};} }; }
module.exports = { createAgentOrchestratorBridge };
