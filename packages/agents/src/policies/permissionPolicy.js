function matchesPermission(granted, required) { return granted === "*" || granted === required || (granted.endsWith(".*") && required.startsWith(granted.slice(0,-1))); }
function hasPermissions(granted=[], required=[]) { return required.every(r=>granted.some(g=>matchesPermission(g,r))); }
module.exports = { hasPermissions };
