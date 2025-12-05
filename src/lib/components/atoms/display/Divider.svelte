<script lang="ts">
	interface Props {
		orientation?: 'horizontal' | 'vertical';
	}

	let { orientation = 'horizontal' }: Props = $props();
</script>

<div class="divider" class:horizontal={orientation === 'horizontal'} class:vertical={orientation === 'vertical'}></div>

<style>
	.divider {
		background-color: var(--color-border);
	}

	.horizontal {
		width: 100%;
		height: 1px;
		margin: var(--spacing-sm) 0;
	}

	.vertical {
		width: 1px;
		height: 100%;
		margin: 0 var(--spacing-sm);
	}
</style>
