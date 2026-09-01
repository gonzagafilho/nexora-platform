const { scoreCapability }=require("../utils/scoreCapability");
function createDelegationPlanner() { return { score(agent,input){const query=typeof input==="string"?input:input?.intent||input?.text||input?.query||JSON.stringify(input);return Math.max(0,...agent.capabilities.map(c=>scoreCapability(c,query)));}, plan(input,agents){return agents.map(agent=>({agent,score:this.score(agent,input)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score)[0]||null;} }; }
module.exports={createDelegationPlanner};
