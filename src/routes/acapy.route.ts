import express from 'express';
import axiosInstance from '../utils/axios';
import { AxiosError } from 'axios';

const router = express.Router();

// health check endpoint
router.get('/status', async (req, res) => {
    try {
        const response = await axiosInstance.get('/status');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch status from ACA-Py' });
    }
})

router.get('/liveness', async (req, res) => {
    try {
        const response = await axiosInstance.get('/status/live');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch liveness from ACA-Py' });
    }
})

// end of health check endpoint

// get wallet DIDs
router.get('/wallet-did', async (req, res) => {
    try {
        // methods also available http://localhost:8021/api/doc#/wallet/get_wallet_did
        const response = await axiosInstance.get('/wallet/did');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wallet DID from ACA-Py' });
    }
})

/**
 * create schema
 * post body example
 * {
    "schema_name": "UniID",
    "schema_version": "1.0",
    "attributes": ["fullname", "sid"]
    }
 */
router.post('/schemas', async (req, res) => {
    try {
        const { schema_name, schema_version, attributes } = req.body;
        if (!schema_name || !schema_version || !Array.isArray(attributes)) {
            return res.status(400).json({ error: 'Missing required fields: schema_name, schema_version, attributes (array)' });
        }
        const schemaData = { schema_name, schema_version, attributes };
        const response = await axiosInstance.post('/schemas', schemaData);
        res.json(response.data);
    } catch (error: AxiosError | any) {
        if (error.response?.status === 400) {
            // ACA-Py returns 400 Bad Request if schema already exists
            res.status(400).json({ error: 'Schema already exists in ACA-Py' });
        } else {
            console.log(error);
            res.status(500).json({ error: 'Failed to create schema in ACA-Py' });
        }
    }
})

/**
 * get all created schemas
 * GET /schemas 
 * methods also available http://localhost:8021/api/doc#/schemas/get_schemas_created
 */

router.get('/schemas', async (req, res) => {
    try {
        const response = await axiosInstance.get('/schemas/created');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schemas from ACA-Py' });
    }
})

/**
 * get schema by schema_id
 * http://localhost:3000/api/v1/schemas/HrtRSHvELgrURjujcYXWVr:2:UniID:1.0
 * methods also available http://localhost:8021/api/doc#/schemas/get_schema
*/
router.get('/schemas/:schema_id', async (req, res) => {
    try {
        const { schema_id } = req.params;
        const response = await axiosInstance.get(`/schemas/${schema_id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schema from ACA-Py' });
    }
})


/**
 * create credential definition
 * its represent a specific instance of a schema that an issuer can use to issue credentials.
 * tags can be different: v1, v2, default, student, employee, etc.
 * post body example
 * {
    "schema_id": "HrtRSHvELgrURjujcYXWVr:2:UniID:1.0",
    "support_revocation": false,
    "tag": "default"
    }
 */

router.post('/credential-definitions', async (req, res) => {
    try {
        const { schema_id, support_revocation, tag } = req.body;
        if (!schema_id || typeof support_revocation !== 'boolean' || !tag) {
            return res.status(400).json({ error: 'Missing required fields: schema_id, support_revocation (boolean), tag' });
        }
        const credentialDefinitionData = { schema_id, support_revocation, tag };
        const response = await axiosInstance.post('/credential-definitions', credentialDefinitionData);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create credential definition in ACA-Py' });
    }
});

// get all created credential definitions
router.get('/credential-definitions', async (req, res) => {
    try {
        const response = await axiosInstance.get('/credential-definitions/created');
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch credential definitions from ACA-Py' });
    }
});

// get credential definition by cred_def_id
router.get('/credential-definitions/:cred_def_id', async (req, res) => {
    try {
        const { cred_def_id } = req.params;
        const response = await axiosInstance.get(`/credential-definitions/${cred_def_id}`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch credential definition from ACA-Py' });
    }
});

// credential issuance endpoint (Using Issue Credential v2.0)
/**
 {
  "connection_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cred_def_id": "HrtRSHvELgrURjujcYXWVr:3:CL:2911236:default",
  "attributes": {
    "fullname": "Alice Doe",
    "uniID": "U12345678"
  }
}
 */
// TODO: check after connection is ready
router.post('/issue-credential', async (req, res) => {
    // automate credential with sending offer to a specific connection_id
    const { connection_id, cred_def_id, attributes } = req.body;

    console.log('connection_id:', typeof connection_id);
    console.log('cred_def_id:', typeof cred_def_id);
    console.log('attributes:', typeof attributes, Array.isArray(attributes));


    if (!connection_id || !cred_def_id || typeof attributes !== 'object') {
        return res.status(400).json({ error: 'Missing required fields: connection_id, cred_def_id, attributes' });
    }

    const issueCredentialDataPayload = {
        connection_id: connection_id,
        credential_preview: {
            "@type": "issue-credential/2.0/credential-preview",
            attributes: attributes
        },
        filter: {
            indy: {
                cred_def_id: cred_def_id
            }
        }
    };

    try {
        const response = await axiosInstance.post('/issue-credential-2.0/send', issueCredentialDataPayload);
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to issue credential in ACA-Py' });
    }
})


// connection endpoints
router.post('/connections/create-invitation', async (req, res) => {
    // label: issuer or verifier name
    const { label } = req.body;

    if (!label) {
        return res.status(400).json({ error: 'Missing required field: label' });
    }

    const connectionPayload = {
        accept: [
            "didcomm/aip1",
            "didcomm/aip2;env=rfc19"
        ],
        handshake_protocols: [
            "https://didcomm.org/didexchange/1.0"
        ],
        label,
        my_label: label,
        protocol_version: '1.1',
        goal: 'Connect to Acao-Py Minimal Backend',
    }

    try {
        const response = await axiosInstance.post('/out-of-band/create-invitation', connectionPayload);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create connection invitation in ACA-Py' });
    }
});

//get connection by id
router.get('/connections/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axiosInstance.get(`/connections/${id}`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch connection from ACA-Py' });
    }
});



export default router;