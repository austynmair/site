<script>
  let showSidebar = false;

  function toggleSidebar() {
    showSidebar = !showSidebar;
  }
</script>

<style>
  .sidebar {
    width: 200px;
    height: 100vh;
    background-color: beige;
    position: fixed;
    top: 0;
    left: 0;
    transition: transform 0.3s ease-in-out;
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }
</style>

<div class="sidebar {showSidebar ? 'show' : ''}">
    <!-- Sidebar content goes here -->
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.
    </p>
  </div>

<button on:click={toggleSidebar}>Toggle Sidebar</button>
