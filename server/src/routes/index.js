import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    code: 200,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    message: 'success',
  });
});

// Mount module routes
import authRoutes from './auth.js';
import categoryRoutes from './categories.js';
import productRoutes from './products.js';
import caseRoutes from './cases.js';
import teamRoutes from './team.js';
import certificateRoutes from './certificates.js';
import inquiryRoutes from './inquiries.js';
import settingRoutes from './settings.js';
import navCategoryRoutes from './navCategories.js';
import navSubcategoryRoutes from './navSubcategories.js';
import articleRoutes from './articles.js';
import heroSlideRoutes from './heroSlides.js';
import uploadRoutes from './upload.js';
import translateRoutes from './translate.js';

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cases', caseRoutes);
router.use('/team', teamRoutes);
router.use('/certificates', certificateRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/settings', settingRoutes);
router.use('/upload', uploadRoutes);
router.use('/nav-categories', navCategoryRoutes);
router.use('/nav-subcategories', navSubcategoryRoutes);
router.use('/articles', articleRoutes);
router.use('/hero-slides', heroSlideRoutes);
router.use('/translate', translateRoutes);

export default router;
