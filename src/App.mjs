import Component from './core/Component.mjs';
import ProductListPage from './pages/ProductListPage.mjs';
import ProductDetailPage from './pages/ProductDetailPage.mjs';
import CartPage from './pages/CartPage.mjs';
import { browserRoute, route } from './router.mjs';

export default class App extends Component {
  constructor(props) {
    super(props);

    browserRoute(this.routes);
    this.routes();
  }

  routes() {
    const mainElement = document.querySelector('.App');

    route({
      path: ['/web/', '/'],
      component: ProductListPage,
      target: mainElement,
      state: {
        productList: []
      }
    });

    route({
      path: '/web/products/:id',
      component: ProductDetailPage,
      target: mainElement,
      state: {
        productDetail: {},
        selectedOptions: []
      }
    });

    route({
      path: '/web/cart',
      component: CartPage,
      target: mainElement,
      state: {
        cartItems: []
      }
    });
  }
}
