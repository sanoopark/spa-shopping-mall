import Component from '../core/Component.mjs';
import { redirect } from '../router.mjs';
import { api } from '../apis/fetch.mjs';
import { toLocaleString } from '../utils.mjs';
import { MESSAGE } from '../constants.mjs';

export default class ProductListPage extends Component {
  async mounted() {
    const response = await api.fetchProducts();

    if (response.isError) {
      alert(MESSAGE.SERVER_ERROR);
      return;
    }

    this.setState({
      productList: response.data
    });
  }

  render() {
    const { productList } = this.state;

    this.target.innerHTML = `
      <div class="ProductListPage">
        <h1>상품목록</h1>
        <ul>
          ${productList
            .map(
              ({ id, name, imageUrl, price }) => `
                <li class="Product" data-id="${id}">
                  <img src="${imageUrl}">
                  <div class="Product__info">
                    <div>${name}</div>
                    <div>${toLocaleString(price)}원~</div>
                  </div>
                </li>
              `
            )
            .join('')}
        </ul>
      </div>`;
  }

  setEvent() {
    this.addEvent({
      eventType: 'click',
      selector: '.ProductListPage',
      callback: this.handleItemClick
    });
  }

  handleItemClick({ target }) {
    const $li = target.closest('.Product');
    const productId = $li.dataset.id;
    redirect(`/web/products/${productId}`);
  }
}
