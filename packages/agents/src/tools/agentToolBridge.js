function createAgentToolBridge(adapter={}) { return { listTools(context){return adapter.listTools?.(context) ?? [];}, searchTools(query,context){return adapter.searchTools?.(query,context) ?? [];}, executeTool(name,payload,context){return adapter.executeTool?.(name,payload,context) ?? {ok:false,name,error:"No tool adapter configured"};} }; }
module.exports = { createAgentToolBridge };
