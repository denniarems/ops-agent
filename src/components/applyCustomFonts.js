// Script to apply custom fonts to specific elements
document.addEventListener('DOMContentLoaded', () => {
  // Apply custom font to all AI Agents text elements
  const applyCustomFontToAIAgents = () => {
    // Find all spans containing "AI Agents" text
    document.querySelectorAll('span').forEach(span => {
      if (span.textContent.trim() === 'AI Agents') {
        // Apply inline styles directly for maximum compatibility
        span.style.fontFamily = '"Montserrat", sans-serif';
        span.style.fontWeight = '800';
        span.style.letterSpacing = '0.03em';
        span.style.textShadow = '0 0 10px rgba(58, 188, 247, 0.3)';
        
        // Also add our custom CSS class as a backup
        span.classList.add('montserrat-font');
        console.log('Applied custom font to AI Agents text:', span);
      }
    });
  };

  // Run immediately and then every second for dynamic content
  applyCustomFontToAIAgents();
  setInterval(applyCustomFontToAIAgents, 1000);
});

export default {};
