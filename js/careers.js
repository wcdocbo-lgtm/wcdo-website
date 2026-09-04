// ========================================
// CAREERS SYSTEM - WCDO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ========================================
    // JOB DATA (Stored in localStorage)
    // ========================================
    const STORAGE_KEY = 'wcdo_jobs';
    const APPLICATIONS_KEY = 'wcdo_applications';

    // Default jobs
    const defaultJobs = [
        {
            id: 1,
            title: 'Community Health Officer',
            department: 'health',
            type: 'full-time',
            location: 'Wote, Makueni',
            description: 'We are seeking a passionate Community Health Officer to lead our health outreach programs in Makueni County. The ideal candidate will have experience in community health, program coordination, and working with vulnerable populations.',
            responsibilities: [
                'Coordinate community health outreach programs',
                'Supervise health volunteers',
                'Monitor and report program outcomes',
                'Build partnerships with health facilities'
            ],
            requirements: [
                'Bachelor\'s degree in Public Health or related field',
                '3+ years of experience in community health',
                'Experience working with NGOs preferred',
                'Strong communication and leadership skills'
            ],
            deadline: '2026-12-31',
            featured: true,
            status: 'active',
            postedDate: '2026-09-01'
        },
        {
            id: 2,
            title: 'Education Program Coordinator',
            department: 'education',
            type: 'full-time',
            location: 'Wote, Makueni',
            description: 'Join our team as an Education Program Coordinator to manage our scholarship programs and educational initiatives across Makueni County.',
            responsibilities: [
                'Manage scholarship selection process',
                'Coordinate with schools and partners',
                'Monitor student progress and outcomes',
                'Develop educational materials and programs'
            ],
            requirements: [
                'Bachelor\'s degree in Education or related field',
                '2+ years of program coordination experience',
                'Experience working with children and youth',
                'Strong organizational skills'
            ],
            deadline: '2026-12-15',
            featured: false,
            status: 'active',
            postedDate: '2026-09-05'
        },
        {
            id: 3,
            title: 'Finance & Administration Officer',
            department: 'finance',
            type: 'full-time',
            location: 'Wote, Makueni',
            description: 'We are looking for a detail-oriented Finance & Administration Officer to manage our financial operations and administrative functions.',
            responsibilities: [
                'Manage financial records and reporting',
                'Prepare budgets and financial statements',
                'Ensure compliance with regulations',
                'Handle procurement and administration'
            ],
            requirements: [
                'Bachelor\'s degree in Finance, Accounting or related',
                'CPA or ACCA qualification preferred',
                '3+ years of financial management experience',
                'Experience with NGO accounting'
            ],
            deadline: '2026-12-20',
            featured: false,
            status: 'active',
            postedDate: '2026-09-10'
        },
        {
            id: 4,
            title: 'Youth Empowerment Intern',
            department: 'empowerment',
            type: 'internship',
            location: 'Wote, Makueni',
            description: 'An exciting internship opportunity for recent graduates passionate about youth development and community empowerment.',
            responsibilities: [
                'Assist with youth program delivery',
                'Support workshop facilitation',
                'Help with program documentation',
                'Engage with youth groups'
            ],
            requirements: [
                'Recent graduate in Social Work, Community Development or related',
                'Passion for youth empowerment',
                'Good communication skills',
                'Ability to work in a team'
            ],
            deadline: '2026-11-30',
            featured: false,
            status: 'active',
            postedDate: '2026-09-15'
        },
        {
            id: 5,
            title: 'Monitoring & Evaluation Officer',
            department: 'administration',
            type: 'contract',
            location: 'Wote, Makueni',
            description: 'We seek a skilled M&E Officer to strengthen our monitoring and evaluation systems across all programs.',
            responsibilities: [
                'Develop M&E frameworks and tools',
                'Collect and analyze program data',
                'Prepare M&E reports',
                'Train staff on M&E practices'
            ],
            requirements: [
                'Bachelor\'s degree in Statistics, M&E or related',
                '2+ years of M&E experience',
                'Experience with data analysis software',
                'Strong report writing skills'
            ],
            deadline: '2026-12-10',
            featured: true,
            status: 'active',
            postedDate: '2026-09-08'
        }
    ];

    // ========================================
    // DATA MANAGEMENT FUNCTIONS
    // ========================================
    function getJobs() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultJobs));
            return defaultJobs;
        } catch (e) {
            console.error('Error loading jobs:', e);
            return defaultJobs;
        }
    }

    function saveJobs(jobs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
        } catch (e) {
            console.error('Error saving jobs:', e);
        }
    }

    function getApplications() {
        try {
            const data = localStorage.getItem(APPLICATIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveApplication(application) {
        const apps = getApplications();
        apps.push({
            ...application,
            id: Date.now(),
            appliedDate: new Date().toISOString()
        });
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    }

    function getJobById(id) {
        const jobs = getJobs();
        return jobs.find(job => job.id === id);
    }

    // ========================================
    // RENDER JOBS
    // ========================================
    function renderJobs(jobs) {
        const jobsList = document.getElementById('jobsList');
        const noJobs = document.getElementById('noJobs');

        if (!jobsList) return;

        if (!jobs || jobs.length === 0) {
            jobsList.innerHTML = '';
            noJobs.style.display = 'block';
            return;
        }

        noJobs.style.display = 'none';

        jobsList.innerHTML = jobs.map(job => `
            <div class="job-card ${job.featured ? 'featured' : ''}">
                <div class="job-info">
                    <h3 class="job-title">
                        <a href="javascript:void(0)" onclick="openJobDetail(${job.id})">${job.title}</a>
                        ${job.featured ? ' <span style="font-size:0.7rem; background:#FF6F00; color:white; padding:2px 10px; border-radius:50px;">Featured</span>' : ''}
                    </h3>
                    <div class="job-meta">
                        <span><i class="fas fa-building"></i> ${job.department.charAt(0).toUpperCase() + job.department.slice(1)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                        <span><i class="fas fa-briefcase"></i> ${job.type.replace('-', ' ').toUpperCase()}</span>
                        <span><i class="fas fa-calendar-alt"></i> Posted: ${formatDate(job.postedDate)}</span>
                    </div>
                    <p class="job-description">${job.description}</p>
                    <div class="job-tags">
                        <span class="tag">${job.department}</span>
                        <span class="tag highlight">${job.type}</span>
                        <span class="tag">${job.location}</span>
                    </div>
                </div>
                <div class="job-apply">
                    <span class="deadline"><i class="fas fa-clock"></i> Deadline: ${formatDate(job.deadline)}</span>
                    <button class="btn-apply" onclick="openApplicationModal(${job.id})">
                        <i class="fas fa-paper-plane"></i> Apply Now
                    </button>
                </div>
            </div>
        `).join('');
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // ========================================
    // FILTER JOBS
    // ========================================
    function filterJobs() {
        const searchTerm = document.getElementById('jobSearch').value.toLowerCase().trim();
        const department = document.getElementById('jobDepartment').value;
        const type = document.getElementById('jobType').value;

        let jobs = getJobs().filter(job => job.status === 'active');

        // Filter by search term
        if (searchTerm) {
            jobs = jobs.filter(job => 
                job.title.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm) ||
                job.department.toLowerCase().includes(searchTerm) ||
                job.location.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by department
        if (department) {
            jobs = jobs.filter(job => job.department === department);
        }

        // Filter by type
        if (type) {
            jobs = jobs.filter(job => job.type === type);
        }

        renderJobs(jobs);
    }

    // ========================================
    // JOB DETAIL VIEW (in modal)
    // ========================================
    function openJobDetail(id) {
        const job = getJobById(id);
        if (!job) return;

        const modal = document.createElement('div');
        modal.className = 'application-modal active';
        modal.id = 'jobDetailModal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal" onclick="closeJobDetail()">&times;</button>
                <h2>${job.title}</h2>
                <div style="display:flex; flex-wrap:wrap; gap:15px; margin:10px 0 20px; color:#666; font-size:0.95rem;">
                    <span><i class="fas fa-building" style="color:#2E7D32;"></i> ${job.department.charAt(0).toUpperCase() + job.department.slice(1)}</span>
                    <span><i class="fas fa-map-marker-alt" style="color:#2E7D32;"></i> ${job.location}</span>
                    <span><i class="fas fa-briefcase" style="color:#2E7D32;"></i> ${job.type.replace('-', ' ').toUpperCase()}</span>
                </div>
                <p style="font-size:1.05rem; line-height:1.7; color:#444;">${job.description}</p>
                
                <h4 style="margin-top:25px; color:#1a1a2e;">Key Responsibilities</h4>
                <ul style="list-style:none; padding:0;">
                    ${job.responsibilities.map(r => `<li style="padding:6px 0; display:flex; align-items:center; gap:10px; color:#555;"><i class="fas fa-check-circle" style="color:#2E7D32;"></i> ${r}</li>`).join('')}
                </ul>

                <h4 style="margin-top:20px; color:#1a1a2e;">Requirements</h4>
                <ul style="list-style:none; padding:0;">
                    ${job.requirements.map(r => `<li style="padding:6px 0; display:flex; align-items:center; gap:10px; color:#555;"><i class="fas fa-check-circle" style="color:#FF6F00;"></i> ${r}</li>`).join('')}
                </ul>

                <div style="margin-top:30px; display:flex; gap:15px; flex-wrap:wrap; justify-content:space-between; align-items:center; padding-top:20px; border-top:1px solid #eee;">
                    <span style="color:#999;"><i class="fas fa-clock"></i> Deadline: ${formatDate(job.deadline)}</span>
                    <button class="btn-apply" onclick="closeJobDetail(); openApplicationModal(${job.id})">
                        <i class="fas fa-paper-plane"></i> Apply Now
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    function closeJobDetail() {
        const modal = document.getElementById('jobDetailModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    // ========================================
    // APPLICATION MODAL
    // ========================================
    function openApplicationModal(jobId) {
        const job = getJobById(jobId);
        if (!job) return;

        const modal = document.getElementById('applicationModal');
        document.getElementById('jobId').value = jobId;
        document.getElementById('jobTitleDisplay').textContent = job.title;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Reset form
        document.getElementById('jobApplicationForm').reset();
        document.getElementById('fileName').style.display = 'none';
    }

    function closeApplicationModal() {
        const modal = document.getElementById('applicationModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // FILE UPLOAD HANDLING
    // ========================================
    document.addEventListener('change', function(e) {
        if (e.target.id === 'applicantCV') {
            const file = e.target.files[0];
            const fileNameDisplay = document.getElementById('fileName');
            if (file) {
                fileNameDisplay.textContent = `File selected: ${file.name}`;
                fileNameDisplay.style.display = 'block';
            } else {
                fileNameDisplay.style.display = 'none';
            }
        }
    });

    // ========================================
    // FORM SUBMISSION
    // ========================================
    document.getElementById('jobApplicationForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            jobId: parseInt(document.getElementById('jobId').value),
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('applicantEmail').value.trim(),
            phone: document.getElementById('applicantPhone').value.trim(),
            location: document.getElementById('applicantLocation').value.trim(),
            experience: document.getElementById('applicantExperience').value,
            education: document.getElementById('applicantEducation').value,
            coverLetter: document.getElementById('applicantCoverLetter').value.trim(),
            source: document.getElementById('applicantSource').value,
            consent: document.getElementById('applicantConsent').checked
        };

        // Validate
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.coverLetter || !formData.consent) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        if (!isValidEmail(formData.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Handle file
        const fileInput = document.getElementById('applicantCV');
        const file = fileInput.files[0];
        if (!file) {
            showNotification('Please upload your CV/resume.', 'error');
            return;
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size must be less than 5MB.', 'error');
            return;
        }

        // Save application (without file data - in real world, would upload to server)
        const application = {
            ...formData,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        };

        saveApplication(application);
        showNotification('Your application has been submitted successfully! We will contact you soon.', 'success');
        closeApplicationModal();

        // Track application in console (for demo)
        console.log('Application submitted:', application);
    });

    // ========================================
    // EVENT LISTENERS
    // ========================================
    document.getElementById('jobSearch').addEventListener('input', filterJobs);
    document.getElementById('jobDepartment').addEventListener('change', filterJobs);
    document.getElementById('jobType').addEventListener('change', filterJobs);

    document.getElementById('clearFilters').addEventListener('click', function() {
        document.getElementById('jobSearch').value = '';
        document.getElementById('jobDepartment').value = '';
        document.getElementById('jobType').value = '';
        filterJobs();
    });

    document.getElementById('closeApplicationModal').addEventListener('click', closeApplicationModal);

    // Close modal on outside click
    document.getElementById('applicationModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeApplicationModal();
        }
    });

    // Close on ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeApplicationModal();
            closeJobDetail();
        }
    });

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 18px 25px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #2E7D32, #1B5E20)' : 'linear-gradient(135deg, #e53935, #c62828)'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 9999;
            max-width: 400px;
            font-weight: 500;
            animation: slideInRight 0.5s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        `;

        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        icon.style.fontSize = '1.3rem';

        const text = document.createElement('span');
        text.textContent = message;

        notification.appendChild(icon);
        notification.appendChild(text);
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease forwards';
                setTimeout(() => {
                    if (notification.parentNode) notification.remove();
                }, 500);
            }
        }, 5000);

        notification.addEventListener('click', function() {
            this.style.animation = 'slideOutRight 0.5s ease forwards';
            setTimeout(() => {
                if (this.parentNode) this.remove();
            }, 500);
        });
    }

    // ========================================
    // EXPOSE FUNCTIONS FOR GLOBAL USE
    // ========================================
    window.openJobDetail = openJobDetail;
    window.closeJobDetail = closeJobDetail;
    window.openApplicationModal = openApplicationModal;
    window.closeApplicationModal = closeApplicationModal;

    // ========================================
    // INITIALIZE
    // ========================================
    renderJobs(getJobs().filter(job => job.status === 'active'));
    console.log('Careers system initialized successfully!');
});