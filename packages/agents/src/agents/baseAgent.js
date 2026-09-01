const { validateAgentDefinition } = require("../contracts/agentContract");
class BaseAgent { constructor(definition) { Object.assign(this,{description:"",version:"0.7.0",enabled:true,role:"specialist",capabilities:[],tools:[],memory:{},planner:{},permissions:[],policies:{},prompts:{},examples:[],metadata:{}},definition); validateAgentDefinition(this); } async execute(input,context) { if(this.handler) return this.handler(input,context); return {message:`${this.name} received input`,input}; } }
module.exports = { BaseAgent };
