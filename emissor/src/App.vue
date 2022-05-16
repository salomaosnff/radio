<template>
  <RouterView />
</template>
<style>
html,
body {
  font: normal 14px Arial;
  background: #333;
  color: white;
}
.d-flex {
  display: flex;
  gap: 1rem;
}

.flex-fill {
  flex: 1;
}

.align-end {
  align-items: flex-end;
}

.align-center {
  align-items: center;
}

button,
.btn {
  display: inline-block;
  border: none;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  background: #000;
  color: #fff;
  font-weight: normal;
  font-family: Arial;
}
</style>
