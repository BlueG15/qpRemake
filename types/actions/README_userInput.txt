/*
Hanadle user inputs : a topic

example effect "init: choose a card on field, add it back to hand (updraft)"

Option 1 : card priority:
effect activation return the action [unfinished-posChanged-type1] (*) (no from, has to) 
  upon the action [effect activation]
and chains to (*) in the chain step to add the action [askForUserInput], targeting the (*)

attr: 
    + cards can have however many fucking inputs they desire in whatever fucking order they want
    + may interfere with actual cards responding to posChanged 
--> scrap

Option 2 : action priority
input type is an inherent property within the base action itself, inputs is then NOT treated as an action
but rather, a part of an action that is acquire at the system level (higher) 
instead of at the creation level in lower levels

asking for input is a step done before declaration (if action wants input)

attr: 
    + cannot require multiple inputs (?)
        --> best way to circumvent this is to make a tally of every input types
        --> orrrrrr make an inputTypeArr

Option 3 : system priority
inputs are stored internally by the action handler, get input is an action but 
cards need not to chain it or chain anything to it      
they can just access the stored inputs

attr:
    + I have to make the cards able to specify which inputs they meant to grab from the tape?
    + IDK???



----> option 2 is best
*/


