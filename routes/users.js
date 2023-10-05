const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

const { isLoggedIn } = require('../middleware');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.get('/spot_volume', users.renderSpotVolume)
router.get('/derivative_volume', users.renderDerVolume)
router.get('/average_price', users.renderAvgPrice)
router.get('/average_market', users.renderAvgMarket)
router.get('/coins_price', users.renderCoinsPrice)
router.get('/render_coin', users.renderCoin)
router.get('/populate', users.populate_data)
router.get('/coin_volume', users.renderVolume)
router.get('/coin_mc', users.renderMc)
router.get('/coin_cs', users.renderCs)
router.get('/render_plat', users.renderPlat)
router.get('/render_week', users.renderWeekly)
router.get('/render_der', users.renderDer)
router.get('/render_intrest', users.renderIntrest)
router.post('register_special', users.register)
router.get('/render_news', users.renderNews)
router.get('/render_vendor_register/:id', users.RenderVendor)
router.get('/markets_news', users.renderMarkets)
router.get('/sacar_datos', users.sacarDatos)
router.get('/read_csv', users.printCSV)
router.get('/render_count', users.renderCount)
router.get('/render_stripe/:id', users.RenderStripe)
router.get('/render_zip_prices', users.renderZipPrices)
router.get('/render_zip_count', users.renderZipCount)
router.get('/render_seg_sum', users.renderSegSum)
router.get('/render_zip_sum', users.zipSegSum)
router.get('/do_excel', users.doExcel)


router.post('/register_stripe/:id', users.RegisterStripe)
router.post('/create_store/:id', users.RegisterVendor)

router.get('/render-cart', users.RenderCuenta)

router.post('/five/:id', users.FiveMin)

router.post('/ready/:id', users.Ready)

router.get('/render_bulk/:id', users.renderBulk)


router.post('/render_bulk/:id', users.renderBulk)

router.get('/render-orders-store/:id', users.RenderStoreOrders)

router.get('/render_vendor_section/:id', users.RenderSelect)

router.get('/order/complete/:id', users.RenderSelectConfirm)

router.get('/render_vendor_section_xlx/:id', users.RenderSelectXlx)

router.post('/order/complete/:id', isLoggedIn, users.completeOrder)

router.get('/render_orders', users.RenderMyOrders)

router.get('/render_posts', users.renderAllPosts)

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

router.get('/render_xlx/:id', users.renderReport)



router.get('/render-orders-tabs/:id', users.renderTabs)

router.get('/render_tab/:id', users.renderSingleTab)

router.post('/complete_tab/:id', users.tabDelivered)

router.get('/sacar_info', users.sacarInfo)

router.get('/resumenes', users.summarizeCoins)

router.get('/business_news', users.renderBusiness)

router.get('/consensus_news', users.renderConsensus)

router.get('/policy_news', users.renderPolicy)

router.get('/market_news', users.renderMarkets)

// router.route('/forgot')
//     .get(users.renderForgot)
//     .post(users.forgot)

// router.route('/reset/:token')
//     .get(users.getToken)
//     .post(users.postToken)


// router.route('/users/reset')
//     .get(users.renderReset)



module.exports = router;