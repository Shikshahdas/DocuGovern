const Category = require('../models/Category');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');

exports.renderCategories = async (req, res) => {
  try {
    const categoryDocs = await Category.find().sort({ name: 1 }).lean();

    const categories = await Promise.all(
      categoryDocs.map(async (cat) => ({
        ...cat,
        docCount: await Document.countDocuments({ category: cat._id })
      }))
    );

    res.render('pages/categories/index', {
      title: 'Document Categories - DocuGovern',
      activeMenu: 'categories',
      categories,
    });
  } catch (error) {
    console.error('Category fetch error:', error);
    res.status(500).render('pages/error', {
      title: 'Categories Error',
      statusCode: 500,
      message: error.message
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) {
      return res.status(400).redirect('/categories?error=Name+is+required');
    }

    const cat = await Category.create({
      name,
      description: description || '',
      color: color || '#4f46e5',
      icon: icon || 'folder',
      createdBy: req.user._id
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'CATEGORY_CREATE',
      details: `Created category "${cat.name}".`
    });

    res.redirect('/categories');
  } catch (error) {
    console.error('Category creation error:', error);
    res.redirect('/categories?error=' + encodeURIComponent(error.message));
  }
};
