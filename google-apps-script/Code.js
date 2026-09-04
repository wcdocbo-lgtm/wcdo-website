// ============================================
// WCDO BLOG SYSTEM - Google Apps Script API
// ============================================

const CONFIG = {
    SHEET_ID: '1C-7Nx0OoMP_tPTqlZCAb-npbLLdbd-PS96HPrkaECZI',
    BLOG_SHEET_NAME: 'Blog Posts'
};

// ============================================
// DO POST - HANDLES ALL POST REQUESTS
// ============================================
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;
        
        let result;
        if (action === 'savePost') {
            result = saveBlogPost(data);
        } else if (action === 'deletePost') {
            result = deleteBlogPost(data.id);
        } else {
            result = { success: false, data: 'Invalid action: ' + action };
        }
        
        return buildCorsResponse(result);
    } catch (error) {
        return buildCorsResponse({ success: false, data: 'Error: ' + error.toString() });
    }
}

// ============================================
// DO GET - HANDLES ALL GET REQUESTS
// ============================================
function doGet(e) {
    try {
        const action = e.parameter.action;
        
        let result;
        if (action === 'getPosts') {
            result = getBlogPosts();
        } else {
            result = { success: false, data: 'Invalid action: ' + action };
        }
        
        return buildCorsResponse(result);
    } catch (error) {
        return buildCorsResponse({ success: false, data: 'Error: ' + error.toString() });
    }
}

// ============================================
// BUILD CORS RESPONSE - CORRECT IMPLEMENTATION
// ============================================
function buildCorsResponse(data) {
    // Create the JSON output
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Return the output directly
    // Note: ContentService doesn't support setHeader()
    // CORS is handled through the Web App deployment settings
    return output;
}

// ============================================
// GET ALL BLOG POSTS
// ============================================
function getBlogPosts() {
    try {
        let sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.BLOG_SHEET_NAME);
        if (!sheet) {
            sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).insertSheet(CONFIG.BLOG_SHEET_NAME);
            sheet.appendRow(['id', 'title', 'category', 'image', 'excerpt', 'content', 'date', 'status', 'author']);
            return { success: true, data: [] };
        }

        const data = sheet.getDataRange().getValues();
        if (data.length < 2) {
            return { success: true, data: [] };
        }

        const headers = data[0];
        const rows = data.slice(1);

        const posts = rows.map(row => {
            const post = {};
            headers.forEach((header, index) => {
                const key = header.toString().toLowerCase().replace(/ /g, '_');
                post[key] = row[index] || '';
            });
            return post;
        });

        const validPosts = posts.filter(p => p.id).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        return { success: true, data: validPosts };
    } catch (error) {
        return { success: false, data: 'Error fetching posts: ' + error.toString() };
    }
}

// ============================================
// SAVE A BLOG POST
// ============================================
function saveBlogPost(data) {
    try {
        let sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.BLOG_SHEET_NAME);
        if (!sheet) {
            sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).insertSheet(CONFIG.BLOG_SHEET_NAME);
            sheet.appendRow(['id', 'title', 'category', 'image', 'excerpt', 'content', 'date', 'status', 'author']);
        }

        const allData = sheet.getDataRange().getValues();
        let rowIndex = -1;

        if (data.id) {
            for (let i = 1; i < allData.length; i++) {
                if (allData[i][0] == data.id) {
                    rowIndex = i + 1;
                    break;
                }
            }
        }

        const postId = data.id || new Date().getTime().toString();
        const rowData = [
            postId,
            data.title || 'Untitled Post',
            data.category || 'News',
            data.image || 'https://via.placeholder.com/800x400/2d5a3d/ffffff?text=WCDO+Blog',
            data.excerpt || (data.content ? data.content.substring(0, 150) + '...' : ''),
            data.content || '',
            data.date || new Date().toISOString().split('T')[0],
            data.status || 'published',
            data.author || 'WCDO Admin'
        ];

        if (rowIndex > 0) {
            sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
        } else {
            sheet.appendRow(rowData);
        }

        return { success: true, data: { message: 'Post saved successfully', id: postId } };
    } catch (error) {
        return { success: false, data: 'Error saving post: ' + error.toString() };
    }
}

// ============================================
// DELETE A BLOG POST
// ============================================
function deleteBlogPost(id) {
    try {
        const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.BLOG_SHEET_NAME);
        if (!sheet) {
            return { success: false, data: 'Sheet not found' };
        }

        const data = sheet.getDataRange().getValues();
        let found = false;

        for (let i = 1; i < data.length; i++) {
            if (data[i][0] == id) {
                sheet.deleteRow(i + 1);
                found = true;
                break;
            }
        }

        if (!found) {
            return { success: false, data: 'Post not found' };
        }

        return { success: true, data: 'Post deleted successfully' };
    } catch (error) {
        return { success: false, data: 'Error deleting post: ' + error.toString() };
    }
}

// ============================================
// TEST FUNCTION - Run from Apps Script editor
// ============================================
function testConnection() {
    try {
        const result = getBlogPosts();
        Logger.log('Test result: ' + JSON.stringify(result));
        return result;
    } catch (error) {
        Logger.log('Test error: ' + error.toString());
        return { success: false, error: error.toString() };
    }
}

// ============================================
// SETUP FUNCTION - Run once to create the sheet
// ============================================
function setupSheet() {
    try {
        let sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.BLOG_SHEET_NAME);
        if (sheet) {
            Logger.log('Sheet already exists');
            return { success: true, message: 'Sheet already exists' };
        }
        
        sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).insertSheet(CONFIG.BLOG_SHEET_NAME);
        sheet.appendRow(['id', 'title', 'category', 'image', 'excerpt', 'content', 'date', 'status', 'author']);
        Logger.log('Sheet created successfully');
        return { success: true, message: 'Sheet created successfully' };
    } catch (error) {
        Logger.log('Setup error: ' + error.toString());
        return { success: false, error: error.toString() };
    }
}