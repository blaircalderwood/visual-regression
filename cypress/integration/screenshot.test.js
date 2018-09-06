describe('Screenshot capture', () => {
  const pages = [{
      url: '/index',
      name: 'home',
    },
    {
      url: '/blog',
      name: 'blog',
    },
    {
      url: '/contact',
      name: 'contact',
    },
  ];

  pages.forEach(page => {
    it('screenshots', () => {
      cy.visit(page.url);
      cy.screenshot(page.name);
    });
  });
});
