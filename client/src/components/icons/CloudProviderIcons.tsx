import React from 'react';

// Google Cloud Platform Icon
export const GCPIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.19 2.38a9.344 9.344 0 0 1 6.64 2.75 9.344 9.344 0 0 1 2.75 6.64v.46a9.344 9.344 0 0 1-2.75 6.64 9.344 9.344 0 0 1-6.64 2.75h-.38a9.344 9.344 0 0 1-6.64-2.75 9.344 9.344 0 0 1-2.75-6.64v-.46a9.344 9.344 0 0 1 2.75-6.64 9.344 9.344 0 0 1 6.64-2.75h.38zm-.19 1.5a7.844 7.844 0 0 0-5.58 2.31A7.844 7.844 0 0 0 4.12 12v.38a7.844 7.844 0 0 0 2.31 5.58A7.844 7.844 0 0 0 12 20.27h.31a7.844 7.844 0 0 0 5.58-2.31A7.844 7.844 0 0 0 20.2 12.38v-.38a7.844 7.844 0 0 0-2.31-5.58A7.844 7.844 0 0 0 12.31 3.88H12z"/>
    <path d="M8.5 9.5h7v1h-7v-1zm0 2h7v1h-7v-1zm0 2h5v1h-5v-1z"/>
  </svg>
);

// Microsoft Azure Icon
export const AzureIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.483 21.3h7.024L8.4 2.7H5.483L.6 21.3h4.883zm8.517 0h9.4L18.517 2.7h-2.917L14 21.3z"/>
    <path d="M12.6 8.1L9.683 15.6h5.834L12.6 8.1z"/>
  </svg>
);

// DigitalOcean Icon
export const DigitalOceanIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c1.821 0 3.54-.486 5.016-1.334l-.004-.004A9.99 9.99 0 0 0 22 12c0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 16v3h-3v-3h3zm-5 0v2h-2v-2h2z"/>
  </svg>
);

// Linode/Akamai Icon
export const LinodeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

// Vultr Icon
export const VultrIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.82 8 12 11.82 5.18 8 12 4.18zM5 9.18l6 3.46v6.72l-6-3.46V9.18zm8 10.18v-6.72l6-3.46v6.72l-6 3.46z"/>
  </svg>
);

// Oracle Cloud Infrastructure Icon
export const OCIIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

// Heroku Icon
export const HerokuIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.61 0H3.39C2.189 0 1.23.96 1.23 2.16v19.681c0 1.198.959 2.159 2.16 2.159h17.22c1.2 0 2.159-.961 2.159-2.159V2.16C22.769.96 21.811 0 20.61 0z"/>
    <path d="M6.63 20.907V3.093h2.538v17.814H6.63zm8.847-10.191c-2.252 0-3.817 1.039-3.817 1.039v9.152h2.538v-7.33s1.027-.651 2.042-.651c1.015 0 1.237.478 1.237 1.303v6.678h2.538v-7.515c0-2.749-1.492-4.676-4.538-4.676zm.956-2.199c.956 0 1.73-.774 1.73-1.73s-.774-1.73-1.73-1.73-1.73.774-1.73 1.73.774 1.73 1.73 1.73z"/>
  </svg>
);

// Railway Icon
export const RailwayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19.5 8.5 12 12 4.5 8.5 12 4.5zM4 10.5l7 3.5v7l-7-3.5v-7zm9 10.5v-7l7-3.5v7L13 21z"/>
  </svg>
);

// Fly.io Icon
export const FlyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.82 8 12 11.82 5.18 8 12 4.18zM5 9.18l6 3.46v6.72l-6-3.46V9.18zm8 10.18v-6.72l6-3.46v6.72l-6 3.46z"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

// Cloudflare Icon
export const CloudflareIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.31 12.5c-.09-.49-.38-.93-.8-1.22-.42-.29-.94-.4-1.45-.31l-11.5 2.1c-.51.09-.93.38-1.22.8-.29.42-.4.94-.31 1.45l.9 4.9c.09.51.38.93.8 1.22.42.29.94.4 1.45.31l11.5-2.1c.51-.09.93-.38 1.22-.8.29-.42.4-.94.31-1.45l-.9-4.9z"/>
    <path d="M18.5 8.5c-.28 0-.55.11-.75.31L12 14.56 6.25 8.81c-.2-.2-.47-.31-.75-.31s-.55.11-.75.31c-.2.2-.31.47-.31.75s.11.55.31.75l6.5 6.5c.2.2.47.31.75.31s.55-.11.75-.31l6.5-6.5c.2-.2.31-.47.31-.75s-.11-.55-.31-.75c-.2-.2-.47-.31-.75-.31z"/>
  </svg>
);

// Vercel Icon
export const VercelIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 20h20L12 2z"/>
  </svg>
);

// Netlify Icon
export const NetlifyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L18.82 8 12 11.82 5.18 8 12 4.18zM5 9.18l6 3.46v6.72l-6-3.46V9.18zm8 10.18v-6.72l6-3.46v6.72l-6 3.46z"/>
    <path d="M8 10h8v1H8v-1zm0 2h6v1H8v-1z"/>
  </svg>
);

// Supabase Icon
export const SupabaseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 12h8v8l10-10h-8V2z"/>
  </svg>
);

// PlanetScale Icon
export const PlanetScaleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M8 8h8v8H8V8zm2 2v4h4v-4h-4z"/>
  </svg>
);

// Render Icon
export const RenderIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L18.82 8 12 11.82 5.18 8 12 4.18zM5 9.18l6 3.46v6.72l-6-3.46V9.18zm8 10.18v-6.72l6-3.46v6.72l-6 3.46z"/>
    <circle cx="12" cy="12" r="1.5"/>
  </svg>
);

// GitHub Icon
export const GitHubIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0.297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

// GitLab Icon
export const GitLabIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.42l3.684-11.333h-7.368L12 21.42z"/>
    <path d="M12 21.42l-3.684-11.333H1.68L12 21.42z"/>
    <path d="M1.68 10.087l-1.316 4.05a.72.72 0 0 0 .263.806L12 21.42 1.68 10.087z"/>
    <path d="M1.68 10.087h6.636L6.05 1.39a.36.36 0 0 0-.684 0l-3.686 8.697z"/>
    <path d="M12 21.42l3.684-11.333h6.636L12 21.42z"/>
    <path d="M22.32 10.087l1.316 4.05a.72.72 0 0 1-.263.806L12 21.42l10.32-11.333z"/>
    <path d="M22.32 10.087h-6.636L17.95 1.39a.36.36 0 0 1 .684 0l3.686 8.697z"/>
  </svg>
);

// Bitbucket Icon
export const BitbucketIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.704z"/>
  </svg>
);

// Docker Hub Icon
export const DockerHubIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.888c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.184-.186H5.136a.186.186 0 0 0-.186.186v1.888c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338 0-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983 0 1.97-.084 2.944-.25 1.32-.225 2.595-.62 3.78-1.177 1.8-.85 3.32-2.12 4.555-3.8a22.568 22.568 0 0 0 2.097-3.326c.061-.789.61-1.514 1.526-2.014.015-.008.029-.017.042-.025l.26-.16-.013-.29c-.014-.327-.114-.49-.202-.602"/>
  </svg>
);
