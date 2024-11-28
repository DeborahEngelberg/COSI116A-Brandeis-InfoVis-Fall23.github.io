const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');
const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
const dropdownItems = document.querySelectorAll('.dropdown-menu div');


/* DONE USING THIS TUTORIAL: https://www.youtube.com/watch?app=desktop&v=5L6h_MrNvsk&t=3m58s */
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetSelector = tab.dataset.tabTarget;
        console.log(`Switching to tab: ${targetSelector}`);
        const target = document.querySelector(targetSelector);

        if (!target) {
            console.error(`No element found for selector: ${targetSelector}`);
            return;
        }

        tabContents.forEach(tabContent => tabContent.classList.remove('active'));
        tabs.forEach(tab => tab.classList.remove('active'));

        tab.classList.add('active');
        target.classList.add('active');
    });
});


dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.includes('.html')) {
            // Allow the browser to navigate to the file
            return;
        }

        e.preventDefault(); // Prevent default only for internal navigation
        const targetId = href.substring(1); // Remove "#" from href
        const targetTab = document.getElementById(targetId);

        if (!targetTab) {
            console.error(`No element found with ID: ${targetId}`);
            return;
        }

        // Switch active tab
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active');
        });
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        targetTab.classList.add('active');
    });
});



dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-tab-target');
        if (!targetId) {
            console.error(`Missing data-tab-target on dropdown item:`, item);
            return;
        }
        const targetTab = document.querySelector(targetId);

        if (!targetTab) {
            console.error(`No element found for selector: ${targetId}`);
            return;
        }

        // Switch active tab
        tabContents.forEach(tabContent => tabContent.classList.remove('active'));
        tabs.forEach(tab => tab.classList.remove('active'));

        targetTab.classList.add('active');
    });
});
