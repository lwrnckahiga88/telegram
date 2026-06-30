/**
 * WRS-OS Runtime Shim
 * Re-exports the WRS Kernel for backward compatibility.
 * The kernel is the authoritative runtime — this file is kept for any legacy imports.
 */
export { kernel as wrsRuntime } from "./kernel";
