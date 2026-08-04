import type { NodeConnectionType } from 'n8n-workflow';

interface ConnectionTypesExport {
	Main?: NodeConnectionType;
}

/**
 * n8n 2.x exports NodeConnectionTypes, while older 1.x installations expect
 * the literal connection name. Keep the runtime fallback so the class can be
 * constructed by both loaders.
 */
export function resolveMainConnectionType(
	connectionTypes: ConnectionTypesExport | undefined,
): NodeConnectionType {
	return connectionTypes?.Main ?? ('main' as NodeConnectionType);
}
