import { Link } from 'react-router-dom';

// Displays one menu item as a card. Used on the Menu page and the
// "Related items" section of the Food Details page.
export default function FoodCard({ item, onAdd, adding }) {
  return (
    <article className="card food-card">
      <img
        className="food-card-img"
        src={item.image || '/images/placeholder-food.jpg'}
        alt={item.name}
        loading="lazy"
      />
      <div className="food-card-body">
        <div className="food-card-top">
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
            <Link to={`/menu/${item.id}`}>{item.name}</Link>
          </h3>
          <span className="food-card-price">₹{Number(item.price).toFixed(0)}</span>
        </div>

        <div className="food-card-badges">
          <span className={`badge ${item.is_vegetarian ? 'badge-veg' : 'badge-nonveg'}`}>
            {item.is_vegetarian ? 'Veg' : 'Non-Veg'}
          </span>
          {!!item.is_featured && <span className="badge badge-featured">Popular</span>}
          {!item.is_available && <span className="badge badge-status">Unavailable</span>}
        </div>

        <p className="food-card-desc">{item.description}</p>

        <div className="food-card-footer">
          <button
            className="btn btn-primary btn-sm btn-block"
            disabled={!item.is_available || adding}
            onClick={() => onAdd?.(item)}
          >
            {!item.is_available ? 'Unavailable' : adding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
