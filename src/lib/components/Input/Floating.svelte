<script lang="ts">
	import { cn } from '$lib/utils';
	import { Eye, EyeClosed } from 'lucide-svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { scale } from 'svelte/transition';

	interface MyProps {
		label: string;
		id: string;
	}

	let {
		class: className,
		label,
		type = 'text',
		id,
		placeholder = ' ',
		...restProps
	}: SvelteHTMLElements['input'] & MyProps = $props();

	let innerType = $state(type); // Used to toggle password visibility
	const classes = {
		label:
			'absolute text-sm text-muted duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:text-primary peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:ltr:translate-x-1 ltr:translate-x-1 peer-focus:rtl:translate-x-1/4 peer-focus:rtl:left-auto',
		input: cn(
			'block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full bg-card-foreground border border-b-background appearance-none text-foreground peer border-b-2 transition-colors text-base font-sans font-normal focus:outline-hidden focus:ring-0 focus:border-b-primary',
			className
		),
		container: 'relative',
		toggleVisibility: {
			button:
				'absolute top-1/2 -translate-y-1/2 right-2.5 rtl:left-2.5 rtl:right-auto size-7 text-muted p-1 rounded-sm hover:bg-card'
		}
	};

	function concatenateClasses(obj: Record<string, any> | string, prefix = ''): string {
		let result = '';

		if (typeof obj === 'string') return obj;

		for (const key in obj) {
			if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
				result += ' ' + concatenateClasses(obj[key], prefix + key);
			} else {
				result +=
					' ' +
					obj[key]
						.split(' ')
						.map((c: string) => prefix + key + c)
						.join(' ');
			}
		}

		return cn(result);
	}

	// Function to toggle password visibility
	function toggleType() {
		innerType = innerType === 'password' ? 'text' : 'password';
	}
</script>

<div class={concatenateClasses(classes.container)}>
	<input
		class={concatenateClasses(classes.input)}
		{id}
		{placeholder}
		type={innerType}
		name={id}
		{...restProps}
	/>
	<label for={id} class={concatenateClasses(classes.label)}>{label}</label>
	{#if type === 'password'}
		<button
			type="button"
			onclick={toggleType}
			class={concatenateClasses(classes.toggleVisibility.button)}
			aria-label="Toggle password field visibility"
		>
			{#if innerType === 'password'}
				<span in:scale>
					<Eye class="size-full" />
				</span>
			{:else}
				<span in:scale>
					<EyeClosed class="size-full" />
				</span>
			{/if}
		</button>
	{/if}
</div>
