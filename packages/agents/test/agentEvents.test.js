const test=require("node:test");const assert=require("node:assert/strict");const {createAgentEventEmitter,createAgentRegistry,createAgentExecutor,createFinanceAgent,AGENT_EVENTS}=require("../src");
test("on receives event",()=>{const e=createAgentEventEmitter();let x;e.on("x",p=>x=p);e.emit("x",2);assert.equal(x,2)});
test("off removes handler",()=>{const e=createAgentEventEmitter();let n=0;const f=()=>n++;e.on("x",f);e.off("x",f);e.emit("x");assert.equal(n,0)});
test("history records events",()=>{const e=createAgentEventEmitter();e.emit("x",{a:1});assert.equal(e.getHistory()[0].payload.a,1)});
test("registry events",()=>{const e=createAgentEventEmitter(),r=createAgentRegistry({eventEmitter:e});r.register(createFinanceAgent());assert.equal(e.getHistory()[0].eventName,AGENT_EVENTS.REGISTERED)});
test("execution events",async()=>{const e=createAgentEventEmitter(),r=createAgentRegistry();r.register(createFinanceAgent());await createAgentExecutor({registry:r,eventEmitter:e}).execute("finance",{},{tenantId:"t",userId:"u",permissions:["*"]});assert.deepEqual(e.getHistory().map(x=>x.eventName),[AGENT_EVENTS.EXECUTION_STARTED,AGENT_EVENTS.EXECUTION_SUCCEEDED])});
