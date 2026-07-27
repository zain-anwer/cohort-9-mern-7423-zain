export const createController = (req,res) =>
{
    console.log('note creation endpoint reached')
    return res.json({'Message' : 'Note Creation Controller Working'})
}

export const updateController = (req,res) =>
{
    console.log('note updation endpoint reached')
    return res.json({'Message' : 'Note Updation Controller Working'})
}

export const deleteController = (req,res) =>
{
    console.log('note deletion endpoint reached')
    return res.json({'Message' : 'Note Deletion Controller Working'})
}

export const readController = (req,res) => 
{
    console.log('note read endpoint reached')
    return res.json({'Message' : 'Note Read Controller Working'})
}