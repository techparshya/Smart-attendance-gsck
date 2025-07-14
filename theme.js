// theme.js
window.onload = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(`${savedTheme}-theme`);

  window.toggleTheme = function () {
    const current = document.body.classList.contains("dark-theme") ? "dark" : "light";
    const newTheme = current === "light" ? "dark" : "light";

    document.body.classList.remove(`${current}-theme`);
    document.body.classList.add(`${newTheme}-theme`);

    localStorage.setItem("theme", newTheme);
  };
};
