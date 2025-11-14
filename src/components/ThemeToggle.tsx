import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="neuro-button rounded-xl w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <i className="bx bx-moon text-xl lg:text-2xl text-[#8EB69B]"></i>
      ) : (
        <i className="bx bx-sun text-xl lg:text-2xl text-[#8EB69B]"></i>
      )}
    </button>
  );
}
