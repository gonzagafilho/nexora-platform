const test=require("node:test");const assert=require("node:assert/strict");const api=require("../src");
for(const [name,factory,domain] of [["system",api.createSystemAgent,"system"],["finance",api.createFinanceAgent,"finance"],["associate",api.createAssociateAgent,"associates"],["protocol",api.createProtocolAgent,"protocols"],["notification",api.createNotificationAgent,"notifications"]])test(`built-in ${name}`,async()=>{const a=factory();assert.equal(a.domain,domain);assert.ok(a.capabilities.length);assert.ok((await a.execute({})).status)});
test("version",()=>assert.equal(api.AGENTS_VERSION,"0.7.0"));
test("public exports",()=>{for(const key of ["createAgentRegistry","createAgentExecutor","BaseAgent","validateAgentDefinition","scoreCapability","AgentError"])assert.ok(api[key])});
