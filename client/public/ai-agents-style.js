// Script to reduce the size of AI Agents text
document.addEventListener('DOMContentLoaded', () => {
  // Function to apply smaller font size to AI Agents text
  const reduceSizeOfAIAgentsText = () => {
    // Find all spans containing "AI Agents" text
    document.querySelectorAll('span').forEach(span => {
      if (span.textContent.trim() === 'AI Agents') {
        // Apply smaller font size directly
        span.style.fontSize = window.innerWidth < 768 ? '1.5rem' : '1.875rem'; // text-2xl on mobile, text-3xl on desktop
        span.style.lineHeight = window.innerWidth < 768 ? '2rem' : '2.25rem';
        span.style.fontFamily = '"Montserrat", sans-serif';
        span.style.fontWeight = '800';
        
        // Log that we found and modified an AI Agents text
        console.log('Reduced size of AI Agents text:', span);
      }
    });
  };

  // Run immediately and then every 500ms for dynamic content
  reduceSizeOfAIAgentsText();
  setInterval(reduceSizeOfAIAgentsText, 500);
  
  // Also run when window is resized
  window.addEventListener('resize', reduceSizeOfAIAgentsText);
});
