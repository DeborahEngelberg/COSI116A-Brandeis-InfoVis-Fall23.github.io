const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');
const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
const dropdownItems = document.querySelectorAll('.dropdown-menu div');


/* DONE USING THIS TUTORIAL: https://www.youtube.com/watch?app=desktop&v=5L6h_MrNvsk&t=3m58s */
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget);
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active')
    })
    tabs.forEach(tab => {
        tab.classList.remove('active');
    })
    tab.classList.add('active');
    target.classList.add('active');
    })
})

dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetTab = document.getElementById(targetId);

        //Switch active tab
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active');
        });
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        targetTab.classList.add('active');

        //Highlighting the parent "visualization" tab

        const visualizationTab = document.querySelector('.tab.dropdown');
        visualizationTab.classList.add('active');
    });
});

dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = link.getAttribute('data-tab-target');
        const targetTab = document.querySelector(targetId);

        //Switch active tab
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active');
        });
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        targetTab.classList.add('active');

        //Highlighting the parent "visualization" tab

        const visualizationTab = document.querySelector('.tab.dropdown');
        visualizationTab.classList.add('active');
    });
})