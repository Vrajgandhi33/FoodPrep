-- Insert sample recipes (these will be inserted for the authenticated user)
INSERT INTO recipes (user_id, name, description, ingredients, instructions, prep_time, cook_time, servings, calories, category) VALUES
(auth.uid(), 'Chicken Stir Fry', 'Quick and healthy chicken stir fry with vegetables', 
'2 chicken breasts, diced
1 bell pepper, sliced
1 onion, sliced
2 cloves garlic, minced
2 tbsp soy sauce
1 tbsp olive oil
1 tsp ginger, grated
Salt and pepper to taste', 
'1. Heat oil in a large pan
2. Add chicken and cook until golden
3. Add vegetables and stir fry for 5 minutes
4. Add garlic, ginger, and soy sauce
5. Cook for another 2 minutes
6. Season with salt and pepper', 
15, 10, 4, 320, 'dinner'),

(auth.uid(), 'Overnight Oats', 'Healthy breakfast that prepares itself overnight', 
'1/2 cup rolled oats
1/2 cup milk
1 tbsp chia seeds
1 tbsp honey
1/4 cup berries
1 tbsp almond butter', 
'1. Mix oats, milk, chia seeds, and honey in a jar
2. Stir well and refrigerate overnight
3. In the morning, top with berries and almond butter
4. Enjoy cold or warm up if preferred', 
5, 0, 1, 280, 'breakfast'),

(auth.uid(), 'Greek Salad', 'Fresh Mediterranean salad perfect for lunch', 
'2 cups mixed greens
1 cucumber, diced
1 cup cherry tomatoes, halved
1/4 red onion, sliced
1/2 cup feta cheese, crumbled
2 tbsp olive oil
1 tbsp lemon juice
1 tsp oregano
Salt and pepper to taste', 
'1. Combine greens, cucumber, tomatoes, and onion in a bowl
2. Top with feta cheese
3. Whisk together olive oil, lemon juice, and oregano
4. Drizzle dressing over salad
5. Season with salt and pepper', 
10, 0, 2, 220, 'lunch');
