import { noop } from "./common.js";

/**
 * @template T
 * @param {import('./public.js').Readable<T> | null | undefined} store
 * @param {(value: T) => void} run
 * @param {(value: T) => void} [invalidate]
 * @returns {() => void}
 */
export function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		run(undefined);

		if (invalidate) invalidate(undefined);

		return noop;
	}

	// Svelte store takes a private second argument
	const unsub = store.subscribe(
		run,
		invalidate
	);

	// Also support RxJS
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
