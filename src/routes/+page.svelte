<script>
	import { onDestroy, onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	let articles = [];
	let loading = false;
	let error = '';

	let articleName = '';
	let articleCategory = '';
	let articleDate = '';
	let editingId = null;
	let chartCanvas;
	let chart;

	const ARTICLES_ENDPOINT = '/api/articles';

	const renderChart = () => {
		if (!chartCanvas) return;
		const labels = articles.map((article) => `${articles.articleName} ${articles.articleCategory}`.trim());
		const data = articles.map((article) => Number(article.articleDate) || 0);

		if (!chart) {
			chart = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels,
					datasets: [
						{
							label: 'Date',
							data,
							backgroundColor: [
								'rgb(255, 99, 132)',
								'rgb(54, 162, 235)',
								'rgb(255, 205, 86)',
								'rgb(75, 192, 192)',
								'rgb(153, 102, 255)',
								'rgb(255, 159, 64)',
								'rgb(201, 203, 207)',
								'rgb(99, 255, 132)'
							],
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Article Dates'
            }
          }
				}
			});
			return;
		}

		chart.data.labels = labels;
		chart.data.datasets[0].data = data;
		chart.update();
	};

	const loadArticles = async () => {
		loading = true;
		error = '';
		try {
			const res = await fetch(ARTICLES_ENDPOINT);
			if (!res.ok) throw new Error('Failed to load articles');
			articles = await res.json();
			renderChart();
		} catch (err) {
			error = err?.message ?? 'Something went wrong';
		} finally {
			loading = false;
		}
	};

	const resetForm = () => {
		articleName = '';
		articleCategory = '';
		articleDate = '';
		editingId = null;
	};

	const submitForm = async () => {
		error = '';
		const payload = {
			articleName: articleName.trim(),
			articleCategory: articleCategory.trim(),
			articleDate: Date(articleDate)
		};

		if (!payload.articleName || !payload.articleCategory || !payload.articleDate) {
			error = 'Please enter article name, article Category , and article Date.';
			return;
		}

		try {
			const res = await fetch(editingId ? `${ARTICLES_ENDPOINT}/${editingId}` : ARTICLES_ENDPOINT, {
				method: editingId ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error('Save failed');
			await loadArticles();
			resetForm();
		} catch (err) {
			error = err?.message ?? 'Something went wrong';
		}
	};

	const editArticle = (article) => {
		articleName = article.articleName;
		articleCategory = article.articleCategory;
		articleDate = String(article.articleDate ?? '');
		editingId = article._id;
	};

	const deleteArticle = async (id) => {
		error = '';
		try {
			const res = await fetch(`${ARTICLES_ENDPOINT}/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Delete failed');
			await loadArticles();
		} catch (err) {
			error = err?.message ?? 'Something went wrong';
		}
	};

	onMount(loadArticles);

	onDestroy(() => {
		chart?.destroy();
		chart = null;
	});
</script>

<div class="min-h-screen bg-slate-50 text-slate-900">
	<div class="mx-auto max-w-3xl px-4 py-10">
		<h1 class="text-2xl font-semibold">Admin Portal</h1>
		<p class="mt-1 text-sm text-slate-600">CRUD for Articles</p>

		<div class="mt-6 rounded-lg border bg-white p-4">
			<h2 class="text-sm font-medium text-slate-700">{editingId ? 'Edit article' : 'Add article'}</h2>
			<form class="mt-3" on:submit|preventDefault={submitForm}>
				<div class="grid gap-3 sm:grid-cols-3">
					<input
						class="w-full rounded border px-3 py-2 text-sm"
						placeholder="Article name"
						required
						bind:value={articleName}
					/>
					<input
						class="w-full rounded border px-3 py-2 text-sm"
						placeholder="Article Category"
						required
						bind:value={articleCategory}
					/>
					<input
						class="w-full rounded border px-3 py-2 text-sm"
						placeholder="Date"
						type="date"
						max="2026-02-04"
						required
						bind:value={articleDate}
					/>
				</div>
				<div class="mt-3 flex gap-2">
					<button
						type="submit"
						class="rounded cursor-pointer bg-slate-900 px-4 py-2 text-sm text-white"
					>
						{editingId ? 'Update' : 'Create'}
					</button>
					{#if editingId}
						<button
							type="button"
							class="rounded cursor-pointer border px-4 py-2 text-sm"
							on:click={resetForm}
						>
							Cancel
						</button>
					{/if}
				</div>
				{#if error}
					<p class="mt-3 text-sm text-red-600">{error}</p>
				{/if}
			</form>
		</div>

		<div class="mt-6 rounded-lg border bg-white">
			<div class="flex items-center justify-between border-b px-4 py-3">
				<h2 class="text-sm font-medium text-slate-700">Articles</h2>
				<button class="cursor-pointer text-sm text-slate-600" on:click={loadArticles}>Refresh</button>
			</div>
			{#if loading}
				<p class="px-4 py-6 text-sm text-slate-500">Loading...</p>
			{:else if articles.length === 0}
				<p class="px-4 py-6 text-sm text-slate-500">No articles yet.</p>
			{:else}
				<ul class="divide-y">
					{#each articles as article}
						<li class="flex items-center justify-between px-4 py-3">
							<div>
								<p class="text-sm font-medium">{article.articleName} {article.articleCategory}</p>
								<p class="text-xs text-slate-500">Dates: {article.articleDate}</p>
							</div>
							<div class="flex gap-2">
								<button
									class="rounded cursor-pointer border px-3 py-1 text-xs"
									on:click={() => editArticle(article)}
								>
									Edit
								</button>
								<button
									class="rounded cursor-pointer border px-3 py-1 text-xs text-red-600"
									on:click={() => deleteArticle(article._id)}
								>
									Delete
								</button>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

    <h1 class="text-2xl font-semibold pt-6">Data Visualization</h1>
		<div class="mt-6 rounded-lg border bg-white p-4">
			<h2 class="text-sm font-medium text-slate-700">Dates chart</h2>
			<div class="mt-3 h-64">
				<canvas bind:this={chartCanvas}></canvas>
			</div>
		</div>
	</div>
</div>
