<script>
	import { onDestroy, onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let users = [];
	let loading = false;
	let error = '';

	let firstName = '';
	let lastName = '';
	let age = '';
	let editingId = null;
	let chartCanvas;
	let chart;

	const USERS_ENDPOINT = '/api/users';

	const renderChart = () => {
		if (!chartCanvas) return;
		const labels = users.map((user) => `${user.firstName} ${user.lastName}`.trim());
		const data = users.map((user) => Number(user.age) || 0);

		if (!chart) {
			chart = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels,
					datasets: [
						{
							label: 'Age',
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
              text: 'Users Ages'
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

	const loadUsers = async () => {
		loading = true;
		error = '';
		try {
			const res = await fetch(USERS_ENDPOINT);
			if (!res.ok) throw new Error('Failed to load users');
			users = await res.json();
			renderChart();
		} catch (err) {
			error = err?.message ?? 'Something went wrong';
		} finally {
			loading = false;
		}
	};

	const resetForm = () => {
		firstName = '';
		lastName = '';
		age = '';
		editingId = null;
	};

	const submitForm = async () => {
		error = '';
		const payload = {
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			age: Number(age)
		};

		if (!payload.firstName || !payload.lastName || Number.isNaN(payload.age)) {
			error = 'Please enter first name, last name, and age.';
			return;
		}

		try {
			const res = await fetch(editingId ? `${USERS_ENDPOINT}/${editingId}` : USERS_ENDPOINT, {
				method: editingId ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error('Save failed');
			await loadUsers();
			resetForm();
		} catch (err) {
			error = err?.message ?? 'Something went wrong';
		}
	};

	const editUser = (user) => {
		firstName = user.firstName;
		lastName = user.lastName;
		age = String(user.age ?? '');
		editingId = user._id;
	};

	const deleteUser = async (id) => {
		error = '';
		try {
			const res = await fetch(`${USERS_ENDPOINT}/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Delete failed');
			await loadUsers();
		} catch (err) {
			error = err?.message ?? 'Something went wrong';
		}
	};

	onMount(loadUsers);

	onDestroy(() => {
		chart?.destroy();
		chart = null;
	});
</script>

<div class="min-h-screen bg-slate-50 text-slate-900">
	<div class="mx-auto max-w-3xl px-4 py-10">
		<h1 class="text-2xl font-semibold">Admin Portal</h1>
		<p class="mt-1 text-sm text-slate-600">CRUD for Users</p>

		<div class="mt-6 rounded-lg border bg-white p-4">
			<h2 class="text-sm font-medium text-slate-700">{editingId ? 'Edit user' : 'Add user'}</h2>
			<form class="mt-3" on:submit|preventDefault={submitForm}>
				<div class="grid gap-3 sm:grid-cols-3">
					<input
						class="w-full rounded border px-3 py-2 text-sm"
						placeholder="First name"
						required
						bind:value={firstName}
					/>
					<input
						class="w-full rounded border px-3 py-2 text-sm"
						placeholder="Last name"
						required
						bind:value={lastName}
					/>
					<input
						class="w-full rounded border px-3 py-2 text-sm"
						placeholder="Age"
						type="number"
						min="0"
						required
						bind:value={age}
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
				<h2 class="text-sm font-medium text-slate-700">Users</h2>
				<button class="cursor-pointer text-sm text-slate-600" on:click={loadUsers}>Refresh</button>
			</div>
			{#if loading}
				<p class="px-4 py-6 text-sm text-slate-500">Loading...</p>
			{:else if users.length === 0}
				<p class="px-4 py-6 text-sm text-slate-500">No users yet.</p>
			{:else}
				<ul class="divide-y">
					{#each users as user}
						<li class="flex items-center justify-between px-4 py-3">
							<div>
								<p class="text-sm font-medium">{user.firstName} {user.lastName}</p>
								<p class="text-xs text-slate-500">Age: {user.age}</p>
							</div>
							<div class="flex gap-2">
								<button
									class="rounded cursor-pointer border px-3 py-1 text-xs"
									on:click={() => editUser(user)}
								>
									Edit
								</button>
								<button
									class="rounded cursor-pointer border px-3 py-1 text-xs text-red-600"
									on:click={() => deleteUser(user._id)}
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
			<h2 class="text-sm font-medium text-slate-700">Ages chart</h2>
			<div class="mt-3 h-64">
				<canvas bind:this={chartCanvas}></canvas>
			</div>
		</div>
	</div>
</div>
