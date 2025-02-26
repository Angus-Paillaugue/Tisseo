<script lang="ts">
	import { Bus, MessageCircleWarning } from 'lucide-svelte';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	interface NavItem {
		path: string;
		Icon: any;
	}

	const navItems: NavItem[] = [
		{
			path: '/',
			Icon: Bus
		},
		{
			path: '/networkMessages',
			Icon: MessageCircleWarning
		}
	];

	const isPathActive = (path: string): boolean => {
		return page.url.pathname === path;
	};
</script>

{#snippet navbarItem({ path, Icon }: NavItem)}
	<a
		href={path}
		class={cn(
			'flex flex-row items-center justify-center p-2 text-center transition-colors duration-300',
			isPathActive(path) ? 'text-foreground' : 'text-muted'
		)}
	>
		<Icon />
	</a>
{/snippet}

<div class="w-full shrink-0 px-2 pt-2">
	<nav
		class="bg-card grid w-full overflow-hidden rounded-full border"
		style="grid-template-columns: repeat({navItems.length}, 1fr);"
	>
		{#each navItems as navItem}
			{@render navbarItem(navItem)}
		{/each}
	</nav>
</div>
