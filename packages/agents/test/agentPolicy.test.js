const test=require("node:test");const assert=require("node:assert/strict");const {createAgentContext,createAgentMemoryBridge,createAgentToolBridge,createAgentOrchestratorBridge}=require("../src");
test("context is immutable",()=>{const c=createAgentContext({tenantId:"t",userId:"u"});assert.equal(Object.isFrozen(c),true)});
test("memory adapter",async()=>{const b=createAgentMemoryBridge({resolveContext:()=>({a:1}),saveObservation:r=>r});assert.deepEqual(await b.resolveContext(),{a:1});assert.deepEqual(await b.saveObservation({x:1}),{x:1})});
test("tool adapter",async()=>{const b=createAgentToolBridge({listTools:()=>["x"],searchTools:()=>["x"],executeTool:()=>({ok:true})});assert.deepEqual(await b.listTools(),["x"]);assert.equal((await b.executeTool()).ok,true)});
test("orchestrator adapter",async()=>{const b=createAgentOrchestratorBridge({createPlan:()=>({id:1}),executePlan:()=>({ok:true})});assert.equal((await b.createPlan()).id,1);assert.equal((await b.executePlan()).ok,true)});
test("bridges have safe defaults",async()=>{assert.deepEqual(await createAgentToolBridge().listTools(),[]);assert.equal((await createAgentOrchestratorBridge().createPlan("x")).steps.length,0)});
